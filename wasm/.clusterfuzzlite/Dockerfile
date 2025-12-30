# SPDX-License-Identifier: AGPL-3.0-or-later
# ClusterFuzzLite build environment for ubicity-wasm
FROM gcr.io/oss-fuzz-base/base-builder-rust@sha256:73c1d5648db54100639339d411a5d192cbc8bf413ee91e843a07cf6f0e319dc7

COPY . $SRC/ubicity-wasm
WORKDIR $SRC/ubicity-wasm

COPY .clusterfuzzlite/build.sh $SRC/
