import {Epsilon} from './Epsilon';
import {NonTerminal} from './NonTerminal';
import {Production} from './Production';

const productionHasEpsilon = (production: Production) => {
  return production.rightHandSide.some((symbol) => {
    return symbol instanceof Epsilon;
  });
};

export const removeEpsilonProductions = (productions: Production[]) => {
  let more = true;
  let output = [...productions];
  const parents = new WeakMap<Production, Production>();

  do {
    const leftHandSides = new Set<NonTerminal>();

    more = false;

    for (let production of output) {
      if (productionHasEpsilon(production)) {
        //1. Pick nonterminal A with epsilon production
        more = true;
        leftHandSides.add(production.leftHandSide);
        output.splice(output.indexOf(production), 1);
      }
    }

    //3. For each production containing A: Replicate it 2^k times where k is the
    //number of A instances in the production, such that all combinations of A
    //being there or not will be represented.
    for (let production of output) {
      //Mark the nodes
      let truthCount = 0;
      const last = production.rightHandSide.map(function (symbol) {
        var t = leftHandSides.has(symbol as NonTerminal);
        if (t) ++truthCount;
        return t;
      });

      if (truthCount === 0) return;

      function addProduction() {
        var newProduction = new Production(
          production.leftHandSide,
          production.rightHandSide.filter((_item, i) => !last[i]),
        );
        const exists = output.find((existing) => {
          return existing.equals(newProduction);
        });
        if (!exists) {
          output.push(newProduction);
          parents.set(newProduction, production);
        }
      }

      while (truthCount > 0) {
        addProduction();
        for (var i = 0; i < production.rightHandSide.length; ++i) {
          if (leftHandSides.has(production.rightHandSide[i] as NonTerminal)) {
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
    }
  } while (more); //4. If there are still epsilon productions, go back to step 1
};
