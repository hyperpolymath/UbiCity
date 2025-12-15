# SPDX-License-Identifier: AGPL-3.0-or-later
# ClusterFuzzLite build environment for ubicity-wasm
FROM gcr.io/oss-fuzz-base/base-builder-rust

COPY . $SRC/ubicity-wasm
WORKDIR $SRC/ubicity-wasm

COPY .clusterfuzzlite/build.sh $SRC/
