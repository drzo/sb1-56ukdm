"""Utility class for converting between ReservoirPy and AtomSpace representations."""

from typing import Dict, Union, List
import numpy as np
from atomspace import AtomSpace, Atom, types

class AtomConverter:
    """Convert between ReservoirPy arrays and OpenCog Atoms."""
    
    def __init__(self, atomspace: AtomSpace):
        """Initialize converter with AtomSpace.
        
        Parameters
        ----------
        atomspace : AtomSpace
            OpenCog AtomSpace instance
        """
        self.atomspace = atomspace
        
    def array_to_atoms(
        self, 
        array: np.ndarray,
        prefix: str = "value"
    ) -> List[Atom]:
        """Convert numpy array to list of NumberNodes.
        
        Parameters
        ----------
        array : np.ndarray
            Array to convert
        prefix : str
            Prefix for Atom names
            
        Returns
        -------
        List[Atom]
            List of NumberNode Atoms
        """
        atoms = []
        for i, value in enumerate(array.flatten()):
            atom = self.atomspace.add_node(
                types.NumberNode,
                f"{prefix}_{i}",
                float(value)
            )
            atoms.append(atom)
        return atoms
        
    def atoms_to_array(
        self,
        atoms: List[Atom],
        shape: tuple = None
    ) -> np.ndarray:
        """Convert list of NumberNodes to numpy array.
        
        Parameters
        ----------
        atoms : List[Atom]
            List of NumberNode Atoms
        shape : tuple
            Shape of output array
            
        Returns
        -------
        np.ndarray
            Numpy array containing Atom values
        """
        values = [float(atom.name) for atom in atoms]
        array = np.array(values)
        if shape is not None:
            array = array.reshape(shape)
        return array