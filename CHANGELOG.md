## [5.8.4](https://github.com/mmmeff/outline-mcp-server/compare/v5.8.3...v5.8.4) (2026-01-27)


### Bug Fixes

* **ci:** bump release ([44ab5f6](https://github.com/mmmeff/outline-mcp-server/commit/44ab5f610325ccf6d2a2c0da1bc50ec31ed97a98))

## [5.8.3](https://github.com/mmmeff/outline-mcp-server/compare/v5.8.2...v5.8.3) (2026-01-11)


### Bug Fixes

* **claude:** Remove bun from project to fix claude desktop usage ([8a22064](https://github.com/mmmeff/outline-mcp-server/commit/8a220645b288ef5590e5bd8766343d51bd6a6a77)), closes [#37](https://github.com/mmmeff/outline-mcp-server/issues/37)

## [5.8.2](https://github.com/mmmeff/outline-mcp-server/compare/v5.8.1...v5.8.2) (2025-12-28)


### Bug Fixes

* use latest ref for docker tagging ([3ed92dc](https://github.com/mmmeff/outline-mcp-server/commit/3ed92dca8bc3f5b6d603be4785f993218b5d9761))

## [5.8.1](https://github.com/mmmeff/outline-mcp-server/compare/v5.8.0...v5.8.1) (2025-12-28)


### Bug Fixes

* force run docker release after version publish ([783b8f5](https://github.com/mmmeff/outline-mcp-server/commit/783b8f547586896b1d4225cdc2527eea762874da))

# [5.8.0](https://github.com/mmmeff/outline-mcp-server/compare/v5.7.0...v5.8.0) (2025-12-28)


### Features

* **ci:** add version tag to docker image, run on semantic release version push ([f71a239](https://github.com/mmmeff/outline-mcp-server/commit/f71a23922c472d73deeb3839937d30d789ed158f))

# [5.7.0](https://github.com/mmmeff/outline-mcp-server/compare/v5.6.2...v5.7.0) (2025-12-28)


### Features

* **deps:** update to latest versions of mcp SDK and zod ([79cf029](https://github.com/mmmeff/outline-mcp-server/commit/79cf029deae7a65a289937933ca8e6bc2e224682))

## [5.6.2](https://github.com/mmmeff/outline-mcp-server/compare/v5.6.1...v5.6.2) (2025-12-28)


### Bug Fixes

* **listDocuments:** remove invalid query arg ([1bd48b4](https://github.com/mmmeff/outline-mcp-server/commit/1bd48b49aa736dc6373c0b20ed8130040250ed97)), closes [#33](https://github.com/mmmeff/outline-mcp-server/issues/33)

## [5.6.1](https://github.com/mmmeff/outline-mcp-server/compare/v5.6.0...v5.6.1) (2025-12-28)


### Bug Fixes

* **dxt:** Windows DXT plugin for folders locations ([b425d8e](https://github.com/mmmeff/outline-mcp-server/commit/b425d8e82b9bb399e1a5fbc1c2e8147d3a9e7120)), closes [#28](https://github.com/mmmeff/outline-mcp-server/issues/28)

# [5.6.0](https://github.com/mmmeff/outline-mcp-server/compare/v5.5.5...v5.6.0) (2025-10-12)


### Bug Fixes

* update Dockerfile and release docs with owner placeholder. ([7bcc875](https://github.com/mmmeff/outline-mcp-server/commit/7bcc8757fef83f90058219313c19e23005238904))
* Update with repository owner username. ([7464bd9](https://github.com/mmmeff/outline-mcp-server/commit/7464bd9476a14e955f96f531acb1be5acf082933))


### Features

* add GHCR publish workflow, optimize Dockerfile, and update release docs ([56860ce](https://github.com/mmmeff/outline-mcp-server/commit/56860ceada390a356ef49fddc1eff674e25cdaab))

## [5.5.5](https://github.com/mmmeff/outline-mcp-server/compare/v5.5.4...v5.5.5) (2025-09-01)


### Bug Fixes

* **cd:** correctly mark build-all-assets script as prepare phase for semantic-release ([0a5dee5](https://github.com/mmmeff/outline-mcp-server/commit/0a5dee5209526b5f9f2bfa5d76479deea88ae8d5))

## [5.5.4](https://github.com/mmmeff/outline-mcp-server/compare/v5.5.3...v5.5.4) (2025-09-01)


### Bug Fixes

* **cd:** michael jackson script ([5d63ec6](https://github.com/mmmeff/outline-mcp-server/commit/5d63ec6a5ea791b949e2d7a8492e4dd57e78ebad))
* **dxt:** Add DXT build as a semantic-release plugin ([668bad2](https://github.com/mmmeff/outline-mcp-server/commit/668bad219dd14cafe99c6ec83892cc9841b77518)), closes [#17](https://github.com/mmmeff/outline-mcp-server/issues/17)

## [5.5.3](https://github.com/mmmeff/outline-mcp-server/compare/v5.5.2...v5.5.3) (2025-09-01)


### Reverts

* Revert "fix(dxt): Attempt to fix outdated version numbers on published DXT files" ([a9e16d0](https://github.com/mmmeff/outline-mcp-server/commit/a9e16d0eefeedae0206f19f1c736c6dba30ba4d7))

## [5.5.2](https://github.com/mmmeff/outline-mcp-server/compare/v5.5.1...v5.5.2) (2025-09-01)


### Bug Fixes

* **dxt:** Attempt to fix outdated version numbers on published DXT files ([2c3cb5c](https://github.com/mmmeff/outline-mcp-server/commit/2c3cb5c946408da53b16fe8771e8df6a68ae62ae)), closes [#17](https://github.com/mmmeff/outline-mcp-server/issues/17)

## [5.5.1](https://github.com/mmmeff/outline-mcp-server/compare/v5.5.0...v5.5.1) (2025-09-01)


### Bug Fixes

* **tools:** Mark query as required on listDocuments ([ec7e9ab](https://github.com/mmmeff/outline-mcp-server/commit/ec7e9ab0f5f7b81003f27ca6a0c662a1c974efe0)), closes [#18](https://github.com/mmmeff/outline-mcp-server/issues/18)

# [5.5.0](https://github.com/mmmeff/outline-mcp-server/compare/v5.4.1...v5.5.0) (2025-07-12)


### Features

* **auth:** Support BYO API Keys via request headers (see README.md) ([92ef6f0](https://github.com/mmmeff/outline-mcp-server/commit/92ef6f05f6a59991fdddfeabe6b01b07929c87dc)), closes [#13](https://github.com/mmmeff/outline-mcp-server/issues/13)

## [5.4.1](https://github.com/mmmeff/outline-mcp-server/compare/v5.4.0...v5.4.1) (2025-07-11)


### Bug Fixes

* display correct host in console output ([4a346bd](https://github.com/mmmeff/outline-mcp-server/commit/4a346bd01bdfab8dd2ce4668fa1add81d19e917e))

# [5.4.0](https://github.com/mmmeff/outline-mcp-server/compare/v5.3.1...v5.4.0) (2025-07-10)


### Features

* **server:** add configurable host binding support ([578abbd](https://github.com/mmmeff/outline-mcp-server/commit/578abbd3e7a1d4d1f18b35981652bb370f804ce2))

## [5.3.1](https://github.com/mmmeff/outline-mcp-server/compare/v5.3.0...v5.3.1) (2025-07-07)


### Bug Fixes

* **createDocument:** Merge pull request [#9](https://github.com/mmmeff/outline-mcp-server/issues/9) from eddywashere/patch-1 ([38e17f1](https://github.com/mmmeff/outline-mcp-server/commit/38e17f1b07e6a268f1486d38c67308c1c11af395))

# [5.3.0](https://github.com/mmmeff/outline-mcp-server/compare/v5.2.1...v5.3.0) (2025-07-05)


### Features

* **dxt:** add dxt build scripts ([0125018](https://github.com/mmmeff/outline-mcp-server/commit/01250185454bb930fd92af847a5bc88a9010a85f))

## [5.2.1](https://github.com/mmmeff/outline-mcp-server/compare/v5.2.0...v5.2.1) (2025-06-24)


### Bug Fixes

* **docs:** correct malformed json in readme "Install MCP Server" link ([c7deb4e](https://github.com/mmmeff/outline-mcp-server/commit/c7deb4eb9454e8c5417e14b7bd8c082c57fe1bd2))

# [5.2.0](https://github.com/mmmeff/outline-mcp-server/compare/v5.1.0...v5.2.0) (2025-06-24)


### Features

* **stdio:** re-introduce stdio support ([a709cd2](https://github.com/mmmeff/outline-mcp-server/commit/a709cd2cd67a0acd7d48fdb6620776ee0a3aad61))

# [5.1.0](https://github.com/mmmeff/outline-mcp-server/compare/v5.0.1...v5.1.0) (2025-06-13)


### Features

* **sse:** re-introduce sse backwards compatibility ([0141b3b](https://github.com/mmmeff/outline-mcp-server/commit/0141b3bf89c24072ecad5d4bcdaf5763cab7bf45))

## [5.0.1](https://github.com/mmmeff/outline-mcp-server/compare/v5.0.0...v5.0.1) (2025-06-11)


### Bug Fixes

* **cli:** fix CLI missing shebang ([8c320de](https://github.com/mmmeff/outline-mcp-server/commit/8c320dea175add923291887371fbe4daa0ab5afd))

# [5.0.0](https://github.com/mmmeff/outline-mcp-server/compare/v4.12.2...v5.0.0) (2025-06-11)


### Bug Fixes

* **docs:** correct API URL env var name in README ([a2854f8](https://github.com/mmmeff/outline-mcp-server/commit/a2854f8ae9bea56d2183dc93c59187fe32882ce0))


* BREAKING CHANGE: feat(server): Migrate SSE and STDIO transports to single Streamble HTTP endpoint ([4012979](https://github.com/mmmeff/outline-mcp-server/commit/4012979a428212fa7c7c2abb28bea8dde670c23b))


### BREAKING CHANGES

* chore(deps): Updated minimum node version to 20
* refactor(args): Removed --port CLI flag in favor of OUTLINE_MCP_PORT env var
chore(deps): updated dependencies across the package
chore(test): removed busted janky e2e tests until they can be rewritten against mcp-inspector's CLI as integ
perf(server): swapped out node runtime with bun for bin

## [4.12.3](https://github.com/mmmeff/outline-mcp-server/compare/v4.12.2...v4.12.3) (2025-03-21)


### Bug Fixes

* **docs:** correct API URL env var name in README ([a2854f8](https://github.com/mmmeff/outline-mcp-server/commit/a2854f8ae9bea56d2183dc93c59187fe32882ce0))

## [4.12.2](https://github.com/mmmeff/outline-mcp-server/compare/v4.12.1...v4.12.2) (2025-03-16)


### Bug Fixes

* failure to dynamically load tools when running transpiled code ([b22061c](https://github.com/mmmeff/outline-mcp-server/commit/b22061c138d82bcddecaab0ae59a17f2f6ade312))

## [4.12.1](https://github.com/mmmeff/outline-mcp-server/compare/v4.12.0...v4.12.1) (2025-03-16)


### Bug Fixes

* restore src->build config to not break everything else ([c927dda](https://github.com/mmmeff/outline-mcp-server/commit/c927dda37ad63b667fb9a2b897d1217acf3fd9ae))

# [4.12.0](https://github.com/mmmeff/outline-mcp-server/compare/v4.11.0...v4.12.0) (2025-03-16)


### Features

* Add createTemplateFromDocument too ([9840ae1](https://github.com/mmmeff/outline-mcp-server/commit/9840ae12260891e16a6eaef1ced2da0a00f7d598))

# [4.11.0](https://github.com/mmmeff/outline-mcp-server/compare/v4.10.1...v4.11.0) (2025-03-16)


### Features

* Add natural language endpoint support ([3b804ff](https://github.com/mmmeff/outline-mcp-server/commit/3b804ff40ce1f5815cf9f7c213889e2f2a1f4451))

## [4.10.1](https://github.com/mmmeff/outline-mcp-server/compare/v4.10.0...v4.10.1) (2025-03-16)


### Bug Fixes

* build correct tools list response using mcp lib types ([55c15d4](https://github.com/mmmeff/outline-mcp-server/commit/55c15d444698993bb2a5d7f3250c09207bc1663d))

# [4.10.0](https://github.com/mmmeff/outline-mcp-server/compare/v4.9.0...v4.10.0) (2025-03-16)


### Bug Fixes

* prevent race condition preventing tools from properly registering in toolDefinitions ([864a6bb](https://github.com/mmmeff/outline-mcp-server/commit/864a6bb915943017fdbd99b12baa73eed499b0df))


### Features

* expand parameter support for listDocuments ([f74daeb](https://github.com/mmmeff/outline-mcp-server/commit/f74daeb0789f29766dd95f6a6aa8c91875b370dd))

# [4.9.0](https://github.com/mmmeff/outline-mcp-server/compare/v4.8.3...v4.9.0) (2025-03-16)


### Features

* adopt semantic release ([417b0c1](https://github.com/mmmeff/outline-mcp-server/commit/417b0c1653cac61ccd79ec8acddacb75bec1e611))
