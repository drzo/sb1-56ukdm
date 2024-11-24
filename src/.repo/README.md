## CogUtils ReservoirPy Integration

This package provides integration between ReservoirPy and OpenCog's AtomSpace, allowing reservoir computing nodes to interface with symbolic reasoning systems.

### Features

- ReservoirNode class that extends ReservoirPy's Node
- Conversion utilities between numpy arrays and Atoms
- Integration with OpenCog AtomSpace
- Support for both supervised and unsupervised learning

### Installation

```bash
pip install cogutils-reservoirpy
```

### Usage

```python
from atomspace import AtomSpace
from cogutils_reservoirpy import ReservoirNode

# Create AtomSpace
atomspace = AtomSpace()

# Create reservoir node
node = ReservoirNode(
    units=100,
    input_scaling=0.5,
    spectral_radius=0.9,
    atomspace=atomspace
)

# Process input
import numpy as np
x = np.random.rand(1, 10)
state = node.forward(x)

# Convert to atoms
atoms = node.to_atoms()
```

### Testing

```bash
python -m pytest cogutils_reservoirpy/tests/
```