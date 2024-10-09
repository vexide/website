vexide 0.4.1 is a hotfix for a hard float related issue with VEXos syscalls.

# Changelog

## Fixed

- Updated to vex-sdk 0.21.0, fixing ABI incompatibilities between the VEXos calling convention and the hard-float ABI introduced in vexide 0.4.0. This should fix broken functions that pass floats to the SDK. ([#156](https://github.com/vexide/vexide/pull/156))