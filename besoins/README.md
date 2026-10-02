# Sources fonctionnelles et contrat API

Le dossier `besoins/` porte la description du besoin métier. Le contrat HTTP
OpenAPI consommé par le frontend et le backend est versionné dans les ressources
du backend. Les deux documents sont liés, mais ils n'ont pas le même rôle et ne
se remplacent pas.

## Quel document fait foi ?

| Document | Responsabilité | Ne doit pas devenir |
| --- | --- | --- |
| [Cahier des user stories et règles métier](cahier-user-stories-mvp-association-v2.md) | Acteurs, parcours attendus, invariants, règles de gestion et résultats métier | Une liste implicite d'URLs, de codes HTTP ou de noms de DTO |
| [Contrat OpenAPI](../contribo-back/src/main/resources/contribo-api.yml) | Chemins, `operationId`, paramètres, schémas, enums, formats, réponses, erreurs déclarées et sécurité HTTP | Une copie complète des parcours, des priorités ou des règles qui ne sont pas exposées par l'API |
| [Specs OpenSpec](../openspec/specs/api-design-first-governance/spec.md) | Décisions de gouvernance, critères d'acceptation et traçabilité des évolutions | Une source concurrente des règles métier ou du contrat |

Le cahier décrit ce que l'association doit pouvoir faire et les contraintes qui
doivent rester vraies. OpenAPI décrit la forme stable des échanges nécessaires
pour exposer une capacité. Une règle métier peut donc exister sans endpoint,
et un champ ou un code d'erreur OpenAPI doit être justifié par un besoin ou une
décision documentée.

En cas de divergence, ne pas choisir silencieusement le document le plus facile
à modifier. Documenter l'arbitrage dans une spec OpenSpec, mettre à jour le
cahier si le besoin change, puis modifier le contrat si l'interface exposée est
concernée. Une génération réussie ne valide pas à elle seule une décision
fonctionnelle.

## Chaîne de décision et de génération

1. Décrire ou confirmer le comportement attendu dans le [cahier métier](cahier-user-stories-mvp-association-v2.md) et les critères d'acceptation dans la spec OpenSpec concernée.
2. Déterminer si le comportement nécessite un échange HTTP nouveau ou modifié.
3. Si oui, modifier [contribo-api.yml](../contribo-back/src/main/resources/contribo-api.yml), qui est le contrat canonique partagé. Ne pas créer un second fichier OpenAPI dans le frontend ou le backend.
4. Valider le contrat, contrôler la parité des générateurs, puis régénérer les consommateurs dans l'ordre suivant :

   ```text
   contribo-back/src/main/resources/contribo-api.yml
       -> validation OpenAPI
       -> client Angular et sources API backend
       -> services, mocks et tests concernés
   ```

5. Vérifier la compatibilité, les autorisations, les erreurs et les limites du
   cahier avant de livrer. Les sorties générées ne sont pas modifiées à la main.

Depuis `contribo-front/` :

```bash
npm run validate:api
node ../scripts/check-openapi-generator-version.mjs
npm run generate:api
npx --no-install tsc --noEmit -p tsconfig.app.json
```

Depuis `contribo-back/`, la génération des interfaces et modèles intervient
avec Maven :

```bash
mvn generate-sources
```

Les deux générateurs doivent rester alignés sur la version déclarée dans
[`contribo-front/openapitools.json`](../contribo-front/openapitools.json) et
[`contribo-back/pom.xml`](../contribo-back/pom.xml). Le contrôle
[`check-openapi-generator-version.mjs`](../scripts/check-openapi-generator-version.mjs)
doit réussir avant toute régénération. Le client Angular sous
`contribo-front/src/app/core/api/generated/` et les sources Maven sous
`contribo-back/target/` sont des sorties de génération, pas des sources à
éditer manuellement.

## Liens de référence

- [Documentation frontend](../contribo-front/docs/documentation.md)
- [README frontend et commandes API](../contribo-front/README.md)
- [README backend et génération Maven](../contribo-back/README.md)
- [Gouvernance API Design First](../openspec/specs/api-design-first-governance/spec.md)
- [Spec de séparation besoins et contrat](../openspec/changes/separer-contrat-openapi-documentation/specs/contract-documentation-boundary/spec.md)
