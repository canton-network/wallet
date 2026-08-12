# WARNING: This development environment is contributed by the community.
# It is provided as a convenience and is not part of our build or CI
# configuration. It can (and probably will) be broken many times in the future
# as this repo evolves. Pull requests to keep it working are welcome.
{
  pkgs ? import <nixpkgs> { },
}:
let
  java = pkgs.openjdk;
in
pkgs.mkShell rec {
  buildInputs = [
    java
    pkgs.corepack # This provides pnpm.
    pkgs.nodejs_24
    pkgs.typescript-language-server
  ];

  # nix-shell sets the $name environment variable.  This causes a "bug" in
  # PM2 where all processes end up being named "nix-shell":
  # <https://github.com/Unitech/pm2/issues/5747>.
  # It should be safe to unset this.
  shellHook = "unset name";

  JAVA_HOME = "${java}";
}
