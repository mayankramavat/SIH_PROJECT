"""
Pytest Test Configuration & Global Fixtures (SIH_26246)
-------------------------------------------------------
Compatibility setup for test execution across platforms.
"""
import sys
import types
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Compatibility shim for Windows 11 Smart App Control on Python 3.14
# Scikit-learn imports unused svm/scipy C-extensions which may be blocked by SAC policy.
if "sklearn.svm._libsvm_sparse" not in sys.modules:
    mock_libsvm = types.ModuleType("sklearn.svm._libsvm_sparse")
    sys.modules["sklearn.svm._libsvm_sparse"] = mock_libsvm

if "scipy.optimize._moduleTNC" not in sys.modules:
    mock_tnc = types.ModuleType("scipy.optimize._moduleTNC")
    sys.modules["scipy.optimize._moduleTNC"] = mock_tnc
