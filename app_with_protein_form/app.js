'use strict';
const http = require('http');
var assert = require('assert');
const express= require('express');
const app = express();
const mustache = require('mustache');
const filesystem = require('fs');
const url = new URL(process.argv[3]);
const hbase = require('hbase');
require('dotenv').config()
const port = Number(process.argv[2]);

var hclient = hbase({
	host: url.hostname,
	path: url.pathname ?? "/",
	port: url.port || (url.protocol === 'http:' ? 8090 : 443), // http or https defaults
	protocol: url.protocol.slice(0, -1), // Don't want the colon
	encoding: 'latin1',
	auth: process.env.HBASE_AUTH
});

// Helper function to decode binary data
function decodeBinaryValue(value) {
	try {
		// For floating point numbers stored as binary
		if (value.length === 8) {  // 64-bit double
			return Buffer.from(value).readDoubleLE();
		}
		// For regular string values
		return value.toString();
	} catch (error) {
		console.error('Error decoding value:', error);
		return value;
	}
}



//Testing the HBase connection

hclient.table('yueqil_protein_structure')
	.scan({
		filter:{
			"type": "SingleColumnValueFilter",
			"family": Buffer.from('atom').toString('base64'),
			"qualifier": Buffer.from('type').toString('base64'),
			"op":"EQUAL",
			"comparator":{
				"type":"BinaryComparator",
				"value": Buffer.from('CD1').toString('base64')
			}
		}
	}, function (error, rows)  {
		if (error) {
			console.error('Error scanning protein structure:', error);
			return;
		}

		console.info("yueqil_protein_structure results:");
		console.info('Processed Rows:', rows);

	});


hclient.table('yueqil_protein_stats').row('AF-A0A385XJ53-F1-model_v4').get((error, value) => {
	console.info("yueqil_protein_stats");
	console.info(value);
});

hclient.table('yueqil_residue_distribution').row('AF-A0A385XJ53-F1-model_v4').get((error, value) => {
	console.info("yueqil_residue_distribution");
	console.info(value);
});

hclient.table('yueqil_latest_protein_updates')
	.scan({
		filter:{
			"type": "SingleColumnValueFilter",
			"family": Buffer.from('details').toString('base64'),
			"qualifier": Buffer.from('b_factor').toString('base64'),
			"op":"EQUAL",
			"comparator":{
				"type":"BinaryComparator",
				"value": Buffer.from('N').toString('base64')
			}
		}
	}, function (error, rows)  {
		if (error) {
			console.error('Error scanning latest updates:', error);
			return;
		}

		// Process and log the results
		const processedRows = rows.map(row => ({
			key: row.key,
			column: row.column,
			value: decodeBinaryValue(row.$)
		}));

		console.info("yueqil_latest_protein_updates results:");
		console.info('Processed Rows:', processedRows);

	});

function rowToMap(row) {
	var stats = {}
	row.forEach(function (item) {
		stats[item['column']] = item['$']
	});
	return stats;
}

// Search endpoint
app.get('/protein.html', function (req, res) {
	const proteinId = req.query['protein_id'];
	console.log(proteinId);

	// Get protein stats
	hclient.table('yueqil_protein_stats').row(proteinId).get(function (err, cells) {
		if (err) {
			console.error(err);
			return res.status(500).send('Error retrieving protein stats');
		}

		const statsInfo = rowToMap(cells);

		// Get residue distribution
		hclient.table('yueqil_residue_distribution').row(proteinId).get(function (err, residueCells) {
			if (err) {
				console.error(err);
				return res.status(500).send('Error retrieving residue distribution');
			}

			const residueInfo = rowToMap(residueCells);

			// Scan latest protein updates by filtering on protein_id
			hclient.table('yueqil_latest_protein_updates')
			.scan({
					filter: {
							type: "SingleColumnValueFilter",
							family: Buffer.from('details').toString('base64'),
							qualifier: Buffer.from('protein_id').toString('base64'),
							op: "EQUAL",
							comparator: {
									type: "BinaryComparator",
									value: Buffer.from(proteinId).toString('base64')
							}
					}
			}, function (err, rows) {
					if (err) {
							console.error('Error scanning latest updates:', err);
							return res.status(500).send('Error retrieving latest protein updates');
					}

					// Aggregate data for template rendering
					const combinedUpdates = rows.reduce((acc, row) => {
							const rowMap = rowToMap(row);

							// Example aggregation: Count of unique residues and chains
							const residue = rowMap['details:residue'];
							const chain = rowMap['details:chain'];
							if (residue) acc.uniqueResidues.add(residue);
							if (chain) acc.uniqueChains.add(chain);

							// Summation example: B-Factors (can also calculate avg if needed)
							const bFactor = parseFloat(rowMap['details:b_factor']);
							if (!isNaN(bFactor)) acc.totalBFactor += bFactor;

							return acc;
					}, {
							uniqueResidues: new Set(),
							uniqueChains: new Set(),
							totalBFactor: 0
					});

					// Combine aggregated data with stats and residue info
					var template = filesystem.readFileSync("protein_result.mustache").toString();
					var html = mustache.render(template, {
							protein_id: proteinId,
							avg_b_factor: statsInfo['stats:avg_b_factor'],
							chains: statsInfo['stats:chains'],
							total_atoms: statsInfo['stats:total_atoms'],
							total_residues: statsInfo['stats:total_residues'],
							ALA: residueInfo['counts:ALA'],
							ARG: residueInfo['counts:ARG'],
							ASN: residueInfo['counts:ASN'],
							ASP: residueInfo['counts:ASP'],
							CYS: residueInfo['counts:CYS'],
							GLN: residueInfo['counts:GLN'],
							GLU: residueInfo['counts:GLU'],
							GLY: residueInfo['counts:GLY'],
							HIS: residueInfo['counts:HIS'],
							ILE: residueInfo['counts:ILE'],
							LEU: residueInfo['counts:LEU'],
							LYS: residueInfo['counts:LYS'],
							MET: residueInfo['counts:MET'],
							PHE: residueInfo['counts:PHE'],
							PRO: residueInfo['counts:PRO'],
							SER: residueInfo['counts:SER'],
							THR: residueInfo['counts:THR'],
							TRP: residueInfo['counts:TRP'],
							TYR: residueInfo['counts:TYR'],
							VAL: residueInfo['counts:VAL'],
							unique_residues: combinedUpdates.uniqueResidues.size,
							unique_chains: combinedUpdates.uniqueChains.size,
							total_b_factor: combinedUpdates.totalBFactor
					});
			res.send(html);
		});
	});
})});


/* Send simulated protein to kafka */
var kafka = require('kafka-node');
const { type } = require('os');
var Producer = kafka.Producer;
var KeyedMessage = kafka.KeyedMessage;
var kafkaClient = new kafka.KafkaClient({kafkaHost: process.argv[4]});
var kafkaProducer = new Producer(kafkaClient);


app.get('/update-protein.html', function (req, res) {
	var protein_update = {
			protein_id: req.query['protein_id'],
			atom_id: req.query['atom_id'],
			atom_type: req.query['atom_type'],
			residue: req.query['residue'],
			chain: req.query['chain'],
			x_coord: parseFloat(req.query['x_coord']),
			y_coord: parseFloat(req.query['y_coord']),
			z_coord: parseFloat(req.query['z_coord']),
			b_factor: parseFloat(req.query['b_factor']),
			occupancy: parseFloat(req.query['occupancy'])
	};

	kafkaProducer.send([{ 
			topic: 'yueqil-protein-updates', 
			messages: JSON.stringify(protein_update)
	}], function (err, data) {
			console.log(err);
			console.log(protein_update);
			res.redirect('submit-protein.html');
	});
});

app.use(express.static('public'));
app.listen(port);