
-- Create external table for protein structure view

CREATE EXTERNAL TABLE yueqil_protein_structure_hbase (
    row_key STRING,
    atom_type STRING,
    residue STRING,
    x_coord DOUBLE,
    y_coord DOUBLE,
    z_coord DOUBLE,
    occupancy DOUBLE,
    b_factor DOUBLE
)
STORED BY 'org.apache.hadoop.hive.hbase.HBaseStorageHandler'
WITH SERDEPROPERTIES (
    'hbase.columns.mapping' = ':key,atom:type,atom:residue,atom:x,atom:y,atom:z,atom:occupancy,atom:b_factor'
)
TBLPROPERTIES ('hbase.table.name' = 'yueqil_protein_structure');


-- Create external table for protein summary

CREATE EXTERNAL TABLE yueqil_protein_stats_hbase (
    row_key STRING,
    total_atoms INT,
    total_residues INT,
    unique_chains INT,
    avg_b_factor DOUBLE
)
STORED BY 'org.apache.hadoop.hive.hbase.HBaseStorageHandler'
WITH SERDEPROPERTIES (
    'hbase.columns.mapping' = ':key,stats:total_atoms,stats:total_residues,stats:chains,stats:avg_b_factor'
)
TBLPROPERTIES ('hbase.table.name' = 'yueqil_protein_stats');


-- Create external table for residue distribution

CREATE EXTERNAL TABLE yueqil_residue_dist_hbase (
    row_key STRING,
    ALA_count INT,
    ARG_count INT,
    ASN_count INT,
    ASP_count INT,
    CYS_count INT,
    GLN_count INT,
    GLU_count INT,
    GLY_count INT,
    HIS_count INT,
    ILE_count INT,
    LEU_count INT,
    LYS_count INT,
    MET_count INT,
    PHE_count INT,
    PRO_count INT,
    SER_count INT,
    THR_count INT,
    TRP_count INT,
    TYR_count INT,
    VAL_count INT
)
STORED BY 'org.apache.hadoop.hive.hbase.HBaseStorageHandler'
WITH SERDEPROPERTIES (
    'hbase.columns.mapping' = ':key,counts:ALA,counts:ARG,counts:ASN,counts:ASP,counts:CYS,counts:GLN,counts:GLU,counts:GLY,counts:HIS,counts:ILE,counts:LEU,counts:LYS,counts:MET,counts:PHE,counts:PRO,counts:SER,counts:THR,counts:TRP,counts:TYR,counts:VAL'
)
TBLPROPERTIES ('hbase.table.name' = 'yueqil_residue_distribution');

