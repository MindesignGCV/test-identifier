{
  inputs = {
    nixpkgs.url = github:NixOS/nixpkgs;
    flake-utils.url = github:numtide/flake-utils;
  };

  outputs = inputs@{ self, nixpkgs, flake-utils, ... }:
    (flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs {
          inherit system;
        };
        callPackage = nixpkgs.lib.callPackageWith (pkgs // { inherit inputs; });
      in
      {
        devShell = callPackage ./nix/config/dev-shell.nix { };
      }
    ))
    //
    { };
}
