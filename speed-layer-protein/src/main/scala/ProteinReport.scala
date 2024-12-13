case class ProteinStructureUpdate(
    protein_id: String,
    atom_id: String,
    atom_type: String,
    residue: String,
    chain: String,
    x_coord: Double,
    y_coord: Double,
    z_coord: Double,
    b_factor: Double,
    occupancy: Double
)