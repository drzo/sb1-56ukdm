"""Tests for ReservoirPy Node OpenCog integration."""

import pytest
import numpy as np
from atomspace import AtomSpace
from cogutils_reservoirpy import ReservoirNode, AtomConverter

def test_reservoir_node_initialization():
    """Test ReservoirNode initialization."""
    atomspace = AtomSpace()
    node = ReservoirNode(
        units=10,
        input_scaling=0.5,
        spectral_radius=0.9,
        atomspace=atomspace
    )
    
    assert node.hypers["units"] == 10
    assert node.hypers["input_scaling"] == 0.5
    assert node.hypers["spectral_radius"] == 0.9
    assert node.atomspace == atomspace
    
def test_reservoir_forward():
    """Test reservoir forward pass."""
    node = ReservoirNode(units=5)
    x = np.random.rand(1, 3)
    
    # First forward pass initializes weights
    state = node.forward(x)
    assert state.shape == (1, 5)
    
    # Check weights initialized correctly
    assert node.params["Win"].shape == (5, 3)
    assert node.params["W"].shape == (5, 5)
    
    # Second forward pass uses existing weights
    state2 = node.forward(x)
    assert not np.array_equal(state, state2)
    
def test_atom_conversion():
    """Test conversion between arrays and atoms."""
    atomspace = AtomSpace()
    node = ReservoirNode(units=3, atomspace=atomspace)
    x = np.random.rand(1, 2)
    
    # Generate reservoir state
    state = node.forward(x)
    
    # Convert to atoms
    atoms = node.to_atoms()
    assert len(atoms) == 3  # Win, W, state
    
    # Check atoms are in atomspace
    for atom in atoms.values():
        assert atom in atomspace