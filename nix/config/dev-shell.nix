{ inputs, mkShell, system, lib, nodejs-17_x }:
mkShell
{
  nativeBuildInputs = [
    nodejs-17_x
  ];
}
