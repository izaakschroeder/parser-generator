
const removeEpsilonProductions = (productions: Production[]) => {
  let more = true;
  let output = new Set(productions);
  do {
    var leftHandSides = {};

    more = false;

    for (let production of output) {
      if (production.rightHandSide.contains(Grammar.epsilon)) {
        //1. Pick nonterminal A with epsilon production
        more = true;
        leftHandSides[production.leftHandSide] = true;
        output.delete(production);
      }
    }

    //3. For each production containing A: Replicate it 2^k times where k is the
    //number of A instances in the production, such that all combinations of A
    //being there or not will be represented.
    for (let production of output) {
      //Mark the nodes
      var truthCount = 0,
        last = production.rightHandSide.map(function (symbol) {
          var t = symbol in leftHandSides;
          if (t) ++truthCount;
          return t;
        });

      if (truthCount === 0) return;

      function addProduction() {
        var newProduction = new Production(
          production.leftHandSide,
          production.rightHandSide.filter(function (item, i) {
            return !last[i];
          }),
          production,
        );
        if (!(newProduction.key() in grammar.productions))
          grammar.production(newProduction);
      }

      while (truthCount > 0) {
        addProduction();
        for (var i = 0; i < production.rightHandSide.length; ++i) {
          if (production.rightHandSide[i] in leftHandSides) {
            if (last[i]) {
              last[i] = false;
              --truthCount;
              break;
            } else {
              last[i] = true;
              ++truthCount;
            }
          }
        }
      }

      addProduction();
    };
  } while (more); //4. If there are still epsilon productions, go back to step 1
}
