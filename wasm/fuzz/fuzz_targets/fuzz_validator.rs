// SPDX-License-Identifier: AGPL-3.0-or-later
//! Fuzz target for ubicity-wasm JSON parsing and validation

#![no_main]

use libfuzzer_sys::fuzz_target;
use serde::{Deserialize, Serialize};

// Mirror the structures from lib.rs for fuzzing without wasm-bindgen
#[derive(Serialize, Deserialize)]
struct Experience {
    id: String,
    timestamp: String,
    learner: Learner,
    context: Context,
    experience: ExperienceData,
}

#[derive(Serialize, Deserialize)]
struct Learner {
    id: String,
}

#[derive(Serialize, Deserialize)]
struct Context {
    location: Location,
}

#[derive(Serialize, Deserialize)]
struct Location {
    name: String,
    coordinates: Option<Coordinates>,
}

#[derive(Serialize, Deserialize)]
struct Coordinates {
    latitude: f64,
    longitude: f64,
}

#[derive(Serialize, Deserialize)]
struct ExperienceData {
    #[serde(rename = "type")]
    type_field: String,
    description: String,
    domains: Option<Vec<String>>,
}

fuzz_target!(|data: &[u8]| {
    if let Ok(input) = std::str::from_utf8(data) {
        // Fuzz Experience parsing (used by validate)
        let _ = serde_json::from_str::<Experience>(input);

        // Fuzz Vec<Experience> parsing (used by generate_domain_network)
        let _ = serde_json::from_str::<Vec<Experience>>(input);

        // Fuzz Vec<String> parsing (used by jaccard_similarity)
        let _ = serde_json::from_str::<Vec<String>>(input);

        // Fuzz Coordinates parsing
        let _ = serde_json::from_str::<Coordinates>(input);

        // Fuzz Location parsing
        let _ = serde_json::from_str::<Location>(input);
    }
});
