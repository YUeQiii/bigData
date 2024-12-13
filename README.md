# E. coli Protein Structure and Data Pipeline

This project is focused on the analysis and management of E. coli protein structure data using Big Data tools such as HDFS, Hive, HBase, Kafka, and Spark. The data pipeline processes protein structure data from an initial CIF format, transforms it into a CSV format, and loads it into various layers of a big data system for analytics and serving.

## Github link

## Project Overview
This project consists of multiple components, including:

- **Data Transformation**: A Python script (cif_to_csv.py) to convert protein structure data from CIF format to CSV.
- **Data Upload**: Data is transferred from local systems to a remote cluster, loaded into HDFS, and further processed in Hive.
- **Batch Layer**: HBase tables are created to store protein structures, statistics, and other protein-related data.
- **Speed Layer**: Real-time updates from Kafka are processed using Spark, providing fast access to the latest protein data.
- **Serving Layer**: A frontend app (app_with_protein_form/) to serve and display protein data.

## Project Structure 
### 1. **cif_to_csv.py**
- This Python script converts CIF (Crystallographic Information File) format protein data into a CSV format suitable for loading into Hive and HBase.
- Data is uploaded to a remote cluster using SCP and placed into HDFS.

### 2. **Hive and HBase Tables (hive-hbase-table)**
- **Hive**: Creates tables to store the protein structure data in Hive for batch processing.
- **HBase**: Stores the protein structures, statistics, and residue distribution in HBase for real-time querying.

  The following tables are created in HBase:
- yueqil_protein_structure: Stores the atomic details of proteins.
- yueqil_protein_stats: Stores statistics about proteins, such as the number of atoms, residues, chain count, and average B-factor.
- yueqil_residue_distribution: Stores amino acid distribution and secondary structure elements for each protein.
- yueqil_latest_protein_updates: Stores real-time updates of protein data using Kafka and Spark.

### 3. **Kafka Integration**
- A Kafka topic (yueqil-protein-updates) is used to simulate and manage real-time protein updates.
- The Kafka producer sends updates to the Kafka topic, and the Spark consumer processes these updates to HBase in the speed layer.

### 4. **Speed Layer (speed-layer-protein)**
- The Spark-based Scala code in speed-layer-protein listens to the Kafka topic and updates HBase with real-time data.
- The speed layer ensures low-latency updates to the HBase tables, enabling fast access to the latest data.

### 5. **Serving Layer (app_with_protein_form)**
- The serving layer consists of a frontend application (app_with_protein_form/) that interacts with HBase to query and display protein data.
- It also includes functionality to simulate new data submissions to the Kafka topic.

## Workflow Overview
### 1. Data Transformation and Upload
- Step 1: Run the cif_to_csv.py script to transform CIF data into CSV format.
- Step 2: Upload the CSV data to the remote cluster using SCP.
- Step 3: Use HDFS commands to place the CSV data into HDFS.
- Step 4: Create the necessary Hive tables and load data into Hive.
- Step 5: Load the data from CSV into HBase using HiveQL queries.

### 2. HBase Table Creation
- Create HBase tables for storing protein structure details, statistics, residue distributions, and real-time updates.
- Tables are created with appropriate row keys and column families for efficient querying.

### 3. Real-Time Data with Kafka and Spark
- **Kafka Topic Creation**: Create a Kafka topic (yueqil-protein-updates) for real-time protein updates.
- **Speed Layer**: Use the spark-submit command to process updates from the Kafka topic and write them to HBase in near real-time.

### 4. Serving Layer and Frontend
- The frontend app (app_with_protein_form/) provides a user interface to interact with the data.
- The app simulates submitting new protein data to the Kafka topic and retrieves data from HBase for display.

## Setup and Installation
### 1. Prerequisites
Hadoop (HDFS)
Apache Hive
HBase
Kafka
Spark
Node.js (for frontend application)

### 2. Environment Configuration
Ensure you have SSH access to the cluster.
Set up Kafka brokers.

### 3. Running the Project
#### 1. Data Transformation and Upload

- Execute the Python script:
```
python cif_to_csv.py
```

- Upload the transformed CSV to the cluster:
```
scp -i /path/to/private-key /local/path/to/file.csv sshuser@cluster:/remote/path/

```
- Load the data into Hive and HBase:
```
-- Create and load Hive table
CREATE TABLE yueqil_protein_structures (...);
LOAD DATA INPATH '/path/to/data.csv' INTO TABLE yueqil_protein_structures;

-- Create HBase tables
create 'yueqil_protein_structure', {NAME => 'atom', VERSIONS => 1}, {NAME => 'meta', VERSIONS => 1};
create 'yueqil_protein_stats', {NAME => 'stats', VERSIONS => 1};
create 'yueqil_residue_distribution', 'counts';
create 'yueqil_latest_protein_updates', 'details';
```

#### 2. Kafka Setup
- Create a Kafka topic:
```
kafka-topics.sh --create --replication-factor 3 --partitions 1 --topic yueqil-protein-updates --bootstrap-server $KAFKABROKERS
```
- Simulate submitting data to the Kafka topic by running the frontend app
```
node app.js 3512 https://hbase-cluster-url/hbaserest $KAFKABROKERS/node app.js 3512 http://10.0.0.26:8090 $KAFKABROKERS
```
#### 3. Speed Layer with Spark
- Submit the Spark job to process Kafka updates
```
spark-submit --driver-java-options "-Dlog4j.configuration=file:///path/to/ss.log4j.properties" --class StreamProtein /path/to/uber-speed-layer-protein-1.0-SNAPSHOT.jar $KAFKABROKERS
```



### 4. Frontend
- The frontend app (app_with_protein_form/) provides an interface to interact with the protein data in real-time.
- The app simulates the process of submitting new data to Kafka, which is then processed and stored in HBase.

## Conclusion
This project integrates a variety of Big Data technologies (HDFS, Hive, HBase, Kafka, Spark) to provide a comprehensive pipeline for managing and analyzing protein structure data. By combining batch and speed layers, it ensures both efficient storage and real-time data updates.

## Illustration
Due to network restrictions in China after I back to home at 9th, I am unable to access certain websites for testing or providing screenshots. Using a VPN results in proxy conflicts, making it impossible for me to log in.

Before traveling to China, I successfully accessed the relevant pages, submitted data to the topic, and used Spark-submit to transfer data from Kafka to the HBase table. However, after making modifications to the code upon my return, I am currently unable to test or provide updated screenshots.

Despite these limitations, I have ensured that all necessary code files are included in this repository, and the logic has been thoroughly reviewed for correctness. If further clarification or additional information is needed, please feel free to reach out.

Thank you for your understanding.






