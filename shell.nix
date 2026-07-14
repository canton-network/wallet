{
  pkgs ? import <nixpkgs> { },
}:
let
  java = pkgs.openjdk;
in
pkgs.mkShell rec {
  # Some of the scripting uses tsup, but we rely on nix instead to provision
  # this, so replace it by a stub.
  tsup = pkgs.writeShellScriptBin "tsup" ''
    #!/usr/bin/env bash
    exec true
  '';

  buildInputs = [
    java
    pkgs.corepack # This provides yarn.
    pkgs.nodejs_24
    pkgs.typescript-language-server
    tsup
  ];

  # nix-shell sets the $name environment variable.  This causes a "bug" in
  # PM2 where all processes end up being named "nix-shell":
  # <https://github.com/Unitech/pm2/issues/5747>.
  # It should be safe to unset this.
  shellHook = "unset name";

  JAVA_HOME = "${java}";
}
