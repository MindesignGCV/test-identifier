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
type MessageIds = "ngTestIdentifier";

export const ngTestIdentifier: RuleModule<MessageIds, Options, RuleListener> = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Ensures that the `data-test` attribute is present",
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
      ngTestIdentifier: "The `data-test` attribute is required.",
    },
  },
  create(context) {
    const parserServices = getTemplateParserServices(context);
    const size = context.options[0]?.randomTextOptions?.length || 8;
    const alphabet = context.options[0]?.randomTextOptions?.alphabet || urlAlphabet;
    const tagName = context.options[0]?.tagName || "data-test";

    return {
      [`Element$1:not([name=/ng-container|ng-template|router-outlet/])`](element: TmplAstElement) {
        if (element.attributes.some((attr) => attr.name === tagName)) {
          return;
        }

        const loc = parserServices.convertNodeSourceSpanToLoc(element.sourceSpan);

        const insertOffset = element.sourceSpan.start.offset + element.name.length + 1;

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
