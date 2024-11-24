"""ReservoirPy Node implementation for OpenCog."""

from typing import Optional, Union, Dict, Any
import numpy as np
from reservoirpy.nodes import Node
from atomspace import AtomSpace, Atom, types

class ReservoirNode(Node):
    """ReservoirPy Node that can interface with OpenCog AtomSpace.
    
    Parameters
    ----------
    units : int
        Number of reservoir units
    input_scaling : float
        Input scaling factor
    spectral_radius : float
        Spectral radius of reservoir
    atomspace : AtomSpace
        OpenCog AtomSpace instance
    """
    
    def __init__(
        self,
        units: int = 100,
        input_scaling: float = 1.0,
        spectral_radius: float = 0.99,
        atomspace: Optional[AtomSpace] = None,
        **kwargs
    ):
        super().__init__(
            params={
                "W": None,  # Reservoir weights
                "Win": None,  # Input weights
                "state": None,  # Current state
            },
            hypers={
                "units": units,
                "input_scaling": input_scaling,
                "spectral_radius": spectral_radius,
            },
            **kwargs
        )
        self.atomspace = atomspace or AtomSpace()
        
    def _initialize(self, x: np.ndarray = None) -> None:
        """Initialize reservoir weights and state."""
        n_inputs = x.shape[1] if x is not None else 1
        n_units = self.hypers["units"]
        
        # Initialize input weights
        self.params["Win"] = (
            np.random.uniform(-1, 1, (n_units, n_inputs)) * 
            self.hypers["input_scaling"]
        )
        
        # Initialize reservoir weights
        W = np.random.uniform(-1, 1, (n_units, n_units))
        radius = np.max(np.abs(np.linalg.eigvals(W)))
        self.params["W"] = W * (self.hypers["spectral_radius"] / radius)
        
        # Initialize state
        self.params["state"] = np.zeros((1, n_units))
        
    def forward(self, x: np.ndarray) -> np.ndarray:
        """Compute reservoir state update.
        
        Parameters
        ----------
        x : np.ndarray
            Input data
            
        Returns
        -------
        np.ndarray
            Updated reservoir state
        """
        if self.params["W"] is None:
            self._initialize(x)
            
        prev_state = self.params["state"]
        
        # Update reservoir state
        new_state = np.tanh(
            np.dot(x, self.params["Win"].T) +
            np.dot(prev_state, self.params["W"].T)
        )
        
        self.params["state"] = new_state
        return new_state
        
    def to_atoms(self) -> Dict[str, Atom]:
        """Convert reservoir state to Atoms in AtomSpace.
        
        Returns
        -------
        Dict[str, Atom]
            Dictionary mapping parameter names to Atoms
        """
        atoms = {}
        for name, param in self.params.items():
            if param is not None:
                # Create NumberNode for each parameter value
                atom = self.atomspace.add_node(
                    types.NumberNode,
                    str(param.flatten()[0])
                )
                atoms[name] = atom
        return atoms