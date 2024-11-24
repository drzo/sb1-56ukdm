"""Setup script for CogUtils ReservoirPy integration."""

from setuptools import setup, find_packages

setup(
    name="cogutils-reservoirpy",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "numpy>=1.19.0",
        "reservoirpy>=0.3.0",
        "atomspace>=0.1.0",
        "hyperon>=0.1.0"
    ],
    python_requires=">=3.7",
    author="OpenCog Foundation",
    description="ReservoirPy Node extension for OpenCog CogUtils",
    long_description=open("README.md").read(),
    long_description_content_type="text/markdown",
    url="https://github.com/opencog/cogutils-reservoirpy",
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Science/Research",
        "License :: OSI Approved :: Apache Software License",
        "Programming Language :: Python :: 3",
        "Topic :: Scientific/Engineering :: Artificial Intelligence",
    ],
)