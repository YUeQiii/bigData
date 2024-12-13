import gzip
import csv
import os
import glob

def convert_cif_to_csv(input_dir, output_file):
    with open(output_file, 'w', newline='') as csvfile:
        writer = csv.writer(csvfile)
        # Write header
        writer.writerow(['protein_id', 'atom_id', 'atom_type', 'residue', 'chain', 
                        'x_coord', 'y_coord', 'z_coord', 'occupancy', 'b_factor'])
        
        # Process each .cif.gz file
        for cif_file in glob.glob(os.path.join(input_dir, '*.cif.gz')):
            protein_id = os.path.basename(cif_file).replace('.cif.gz', '')
            
            with gzip.open(cif_file, 'rt') as f:
                for line in f:
                    if line.startswith('ATOM'):
                        parts = line.split()
                        if len(parts) >= 20:
                            writer.writerow([
                                protein_id,          # protein_id
                                parts[1],            # atom_id
                                parts[3],            # atom_type
                                parts[5],            # residue
                                parts[6],            # chain
                                parts[10],           # x_coord
                                parts[11],           # y_coord
                                parts[12],           # z_coord
                                parts[13],           # occupancy
                                parts[14]            # b_factor
                            ])

# Use the converter
input_dir = '/Users/liyueqi/Desktop/bigData/UP000000625_83333_ECOLI_v4'
output_file = 'ecoli_protein_structures.csv'
convert_cif_to_csv(input_dir, output_file)