
# Change Log

## [Unreleased]
### Added
- Added `lookAhead`
- Added `oneOf`
- Added `noneOf`
- Added `Parser.prototype.skip`

### Changed
- Renamed `seq` option "`droppable`" to "`allowPartial`".
- Change type of `choice`.
- Change match algorithm from SameValue to SameValueZero in el and literal.
- Added defaultValue parameter in `regex`.

## [0.6.0] - 2023-01-26
### Added
- Added `option` to Parser class.
- Added `return` to Parser class.
- Added `between` to Parser class.

### Changed
- Merged `left` and `right` into `and`.
- Changed return value of `parse`.

### Fixed
- Fixed `regexGroup` not to ignore the start index.
