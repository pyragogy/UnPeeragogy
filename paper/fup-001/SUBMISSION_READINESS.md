# FUP-001 Submission Readiness

FAC is a target venue, not a reason to inflate the result.

## Required before manuscript completion

### Formal result
- [ ] Alloy model executes under pinned environment.
- [ ] All positive assertions have vacuity witnesses.
- [ ] Negative controls generate interpretable counterexamples.
- [ ] At least one non-trivial governance failure mode is mechanically exposed.
- [ ] Scope escalation performed.
- [ ] Solver replication attempted where practical.
- [ ] Independence sensitivity experiment completed.

### Historical validation
- [x] CAN-001 reconstructed.
- [ ] At least one PENDING case.
- [ ] At least one CONTESTED/revision case.
- [ ] At least one documentary-only candidate.
- [ ] At least one AI-assisted acquisition case.
- [ ] Model mismatches preserved rather than normalised away.

### Methodological integrity
- [x] AI-use log started.
- [x] assumptions separated from repository facts.
- [x] ambiguity register maintained.
- [ ] raw experiment artifacts committed.
- [ ] exact Alloy JAR hash captured.
- [ ] all model changes after first run traceable.
- [ ] threats-to-validity section populated from actual findings.

### Related work
- [ ] systematic search completed.
- [ ] closest competing formal models identified.
- [ ] novelty claim written only after comparison.
- [ ] preprints distinguished from peer-reviewed work.
- [ ] FAC scope fit re-checked at submission time.

## FAC-fit test

A submission should answer all of these convincingly:

1. **What is formally specified?**
2. **What can now be checked that could not be checked before?**
3. **What non-trivial counterexample/property did the formal method reveal?**
4. **Why does the result generalise beyond one repository?**
5. **How is the formal model connected to an actual application?**
6. **What assumptions limit the result?**
7. **Can another researcher rerun the analysis?**

If question 3 cannot be answered, do not submit to FAC.

## Branding discipline

The paper may identify Pyragogy and UnPeeragogy as:
- origin of the research problem;
- open research infrastructure;
- case substrate;
- reproducible artifact.

It must not rely on promotional language.

Academic visibility should derive from:
- DOI-linked artifact;
- open model;
- committed counterexamples;
- reproducible runs;
- methodological transparency;
- explicit negative results;
- a reusable formal kernel.

## Artifact publication plan

If Gate C/D/E pass:

1. tag the exact paper artifact release;
2. archive model/results on Zenodo;
3. mint/version DOI;
4. connect repository release, paper and dataset;
5. publish machine-readable provenance;
6. expose reproducibility instructions;
7. retain raw negative results;
8. cite UnPeeragogy's existing DOI as substrate provenance.
