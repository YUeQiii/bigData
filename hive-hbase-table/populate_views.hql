-- Populate protein structure view

INSERT OVERWRITE TABLE yueqil_protein_structure_hbase
SELECT 
    CONCAT(protein_id, ':', chain, ':', atom_id) as row_key,
    atom_type,
    residue,
    x_coord,
    y_coord,
    z_coord,
    occupancy,
    b_factor
FROM yueqil_protein_structures;


-- Populate protein summary

INSERT OVERWRITE TABLE yueqil_protein_stats_hbase
SELECT 
    protein_id as row_key,
    COUNT(*) as total_atoms,
    COUNT(DISTINCT residue) as total_residues,
    COUNT(DISTINCT chain) as unique_chains,
    AVG(b_factor) as avg_b_factor
FROM yueqil_protein_structures
GROUP BY protein_id;


-- Populate residue distribution
INSERT OVERWRITE TABLE yueqil_residue_dist_hbase
SELECT 
    protein_id as row_key,
    SUM(CASE WHEN residue = 'ALA' THEN 1 ELSE 0 END) as ALA_count,
    SUM(CASE WHEN residue = 'ARG' THEN 1 ELSE 0 END) as ARG_count,
    SUM(CASE WHEN residue = 'ASN' THEN 1 ELSE 0 END) as ASN_count,
    SUM(CASE WHEN residue = 'ASP' THEN 1 ELSE 0 END) as ASP_count,
    SUM(CASE WHEN residue = 'CYS' THEN 1 ELSE 0 END) as CYS_count,
    SUM(CASE WHEN residue = 'GLN' THEN 1 ELSE 0 END) as GLN_count,
    SUM(CASE WHEN residue = 'GLU' THEN 1 ELSE 0 END) as GLU_count,
    SUM(CASE WHEN residue = 'GLY' THEN 1 ELSE 0 END) as GLY_count,
    SUM(CASE WHEN residue = 'HIS' THEN 1 ELSE 0 END) as HIS_count,
    SUM(CASE WHEN residue = 'ILE' THEN 1 ELSE 0 END) as ILE_count,
    SUM(CASE WHEN residue = 'LEU' THEN 1 ELSE 0 END) as LEU_count,
    SUM(CASE WHEN residue = 'LYS' THEN 1 ELSE 0 END) as LYS_count,
    SUM(CASE WHEN residue = 'MET' THEN 1 ELSE 0 END) as MET_count,
    SUM(CASE WHEN residue = 'PHE' THEN 1 ELSE 0 END) as PHE_count,
    SUM(CASE WHEN residue = 'PRO' THEN 1 ELSE 0 END) as PRO_count,
    SUM(CASE WHEN residue = 'SER' THEN 1 ELSE 0 END) as SER_count,
    SUM(CASE WHEN residue = 'THR' THEN 1 ELSE 0 END) as THR_count,
    SUM(CASE WHEN residue = 'TRP' THEN 1 ELSE 0 END) as TRP_count,
    SUM(CASE WHEN residue = 'TYR' THEN 1 ELSE 0 END) as TYR_count,
    SUM(CASE WHEN residue = 'VAL' THEN 1 ELSE 0 END) as VAL_count
FROM yueqil_protein_structures
GROUP BY protein_id;


