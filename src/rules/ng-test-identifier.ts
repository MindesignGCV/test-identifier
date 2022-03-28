import { TmplAstElement } from "@angular/compiler";
import { customAlphabet, urlAlphabet } from "nanoid";

import type { RuleModule, RuleListener } from "@typescript-eslint/utils/dist/ts-eslint";
import { getTemplateParserServices } from "../utils";

type Options = readonly [
  | undefined
  | {
      readonly randomTextOptions?: { readonly length?: number; readonly alphabet?: string };
      readonly tagName?: string;
    }
];
type MessageIds = "ngTestIdentifier" | "ngTestIdentifierUnique";

const values = new Map<string, string>();

export const ngTestIdentifier: RuleModule<MessageIds, Options, RuleListener> = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Ensures that the test identifer attribute (`data-test` by default) is present and unique",
      recommended: "error",
    },
    fixable: "code",
    schema: [
      {
        type: "object",
        properties: {
          tagName: {
            type: "string",
          },
          randomTextOptions: {
            type: "object",
            properties: {
              length: {
                type: "number",
                exclusiveMinimum: 0,
              },
              alphabet: {
                type: "string",
              },
            },
            additionalProperties: false,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      ngTestIdentifier: "The test identifier attribute (`data-test` by default) is required.",
      ngTestIdentifierUnique: "The identifier attribute (`data-test` by default) should be unique.",
    },
  },
  create(context) {
    const parserServices = getTemplateParserServices(context);
    const size = context.options[0]?.randomTextOptions?.length || 8;
    const alphabet = context.options[0]?.randomTextOptions?.alphabet || urlAlphabet;
    const tagName = context.options[0]?.tagName || "data-test";
    const fileName = context.getPhysicalFilename ? context.getPhysicalFilename() : context.getFilename();

    values.forEach((value, key) => {
      if (value === fileName) {
        values.delete(key);
      }
    });

    return {
      [`:not(Element$1[name="svg"]) Element$1:not([name=/ng-container|ng-template|ng-content/])`](
        element: TmplAstElement
      ) {
        if (element.name.startsWith(":") && element.name !== ":svg:svg") {
          return;
        }

        const attr = element.attributes.find((attr) => attr.name === tagName);
        if (attr) {
          if (values.has(attr.value)) {
            const loc = parserServices.convertNodeSourceSpanToLoc(attr.sourceSpan);

            context.report({
              loc,
              messageId: "ngTestIdentifierUnique",
              fix: (fixer) => {
                return fixer.replaceTextRange(
                  [attr.sourceSpan.start.offset, attr.sourceSpan.end.offset],
                  `${tagName}="${customAlphabet(alphabet, size)()}"`
                );
              },
            });
          }

          values.set(attr.value, fileName);

          return;
        }


        const loc = parserServices.convertNodeSourceSpanToLoc(element.sourceSpan);

        const insertOffset =
          element.sourceSpan.start.offset +
          (element.name === ":svg:svg" ? 4 : element.name.length + 1);

        context.report({
          loc,
          messageId: "ngTestIdentifier",
          fix: (fixer) => {
            return fixer.insertTextBeforeRange(
              [insertOffset, insertOffset],
              ` ${tagName}="${customAlphabet(alphabet, size)()}"`
            );
          },
        });
      },
    };
  },
};
