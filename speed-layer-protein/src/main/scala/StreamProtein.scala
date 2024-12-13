import org.apache.kafka.common.serialization.StringDeserializer
import org.apache.spark.SparkConf
import org.apache.spark.streaming._
import org.apache.spark.streaming.kafka010.ConsumerStrategies.Subscribe
import org.apache.spark.streaming.kafka010.LocationStrategies.PreferConsistent
import org.apache.spark.streaming.kafka010._
import com.fasterxml.jackson.databind.{ DeserializationFeature, ObjectMapper }
import com.fasterxml.jackson.module.scala.experimental.ScalaObjectMapper
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import org.apache.hadoop.conf.Configuration
import org.apache.hadoop.hbase.TableName
import org.apache.hadoop.hbase.HBaseConfiguration
import org.apache.hadoop.hbase.client.ConnectionFactory
import org.apache.hadoop.hbase.client.Put
import org.apache.hadoop.hbase.util.Bytes

object StreamProtein {

  // Jackson ObjectMapper for JSON deserialization
  val mapper = new ObjectMapper()
  mapper.registerModule(DefaultScalaModule)

  // HBase connection
  val hbaseConf: Configuration = HBaseConfiguration.create()
  val hbaseConnection = ConnectionFactory.createConnection(hbaseConf)

  val table = hbaseConnection.getTable(TableName.valueOf("yueqil_latest_protein_updates"))

  def main(args: Array[String]) {
    if (args.length < 1) {
      System.err.println(s"""
        |Usage: StreamFlights <brokers> 
        |  <brokers> is a list of one or more Kafka brokers
        | 
        """.stripMargin)
      System.exit(1)
    }

    val Array(brokers) = args

    // Create context with 2 second batch interval
    val sparkConf = new SparkConf().setAppName("StreamProtein")
    val ssc = new StreamingContext(sparkConf, Seconds(2))

    // Create direct kafka stream with brokers and topics
    val topicsSet = Set("yueqil-protein-updates")
    // Create direct kafka stream with brokers and topics
    val kafkaParams = Map[String, Object](
      "bootstrap.servers" -> brokers,
      "key.deserializer" -> classOf[StringDeserializer],
      "value.deserializer" -> classOf[StringDeserializer],
      "group.id" -> "use_a_separate_group_id_for_each_stream",
      "auto.offset.reset" -> "latest",
      "enable.auto.commit" -> (false: java.lang.Boolean)
    )
    val stream = KafkaUtils.createDirectStream[String, String](
      ssc, PreferConsistent,
      Subscribe[String, String](topicsSet, kafkaParams)
    )

    // Get the lines, split them into words, count the words and print
    val serializedRecords = stream.map(_.value);
    val reports = serializedRecords.map(rec => mapper.readValue(rec, classOf[ProteinStructureUpdate]))

    // How to write to an HBase table
    val batchStats = reports.map(update => {
      val put = new Put(Bytes.toBytes(s"${update.atom_id}"))
      put.addColumn(Bytes.toBytes("details"), Bytes.toBytes("protein_id"), Bytes.toBytes(update.protein_id))
      put.addColumn(Bytes.toBytes("details"), Bytes.toBytes("atom_type"), Bytes.toBytes(update.atom_type))
      put.addColumn(Bytes.toBytes("details"), Bytes.toBytes("residue"), Bytes.toBytes(update.residue))
      put.addColumn(Bytes.toBytes("details"), Bytes.toBytes("chain"), Bytes.toBytes(update.chain))
      put.addColumn(Bytes.toBytes("details"), Bytes.toBytes("x_coord"), Bytes.toBytes(update.x_coord))
      put.addColumn(Bytes.toBytes("details"), Bytes.toBytes("y_coord"), Bytes.toBytes(update.y_coord))
      put.addColumn(Bytes.toBytes("details"), Bytes.toBytes("z_coord"), Bytes.toBytes(update.z_coord))
      put.addColumn(Bytes.toBytes("details"), Bytes.toBytes("b_factor"), Bytes.toBytes(update.b_factor))
      put.addColumn(Bytes.toBytes("details"), Bytes.toBytes("occupancy"), Bytes.toBytes(update.occupancy))

      try {
        table.put(put)
      } catch {
        case e : Exception =>
          println(s"Error writing to HBase: $e")
      }
      update
    })
    batchStats.print()
    
    // Start the computation
    ssc.start()
    ssc.awaitTermination()
  }

}
