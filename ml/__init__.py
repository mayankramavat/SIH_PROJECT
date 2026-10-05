"""
Machine Learning & Forecasting Package (SIH_26246)
---------------------------------------------------
Automated compatibility layer for Windows Smart App Control in Python 3.14.
"""
import sys
import types

# Compatibility shim for Windows 11 Smart App Control on Python 3.14
# Scikit-learn imports unused svm/scipy C-extensions which may be blocked by SAC policy.
if "sklearn.svm._libsvm_sparse" not in sys.modules:
    mock_libsvm = types.ModuleType("sklearn.svm._libsvm_sparse")
    sys.modules["sklearn.svm._libsvm_sparse"] = mock_libsvm

if "scipy.optimize._moduleTNC" not in sys.modules:
    mock_tnc = types.ModuleType("scipy.optimize._moduleTNC")
    sys.modules["scipy.optimize._moduleTNC"] = mock_tnc
