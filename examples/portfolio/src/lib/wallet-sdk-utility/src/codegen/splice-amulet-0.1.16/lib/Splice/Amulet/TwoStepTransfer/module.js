"use strict";
/* eslint-disable-next-line no-unused-vars */
function __export(m) {
/* eslint-disable-next-line no-prototype-builtins */
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable-next-line no-unused-vars */
var jtv = require('@mojotech/json-type-validation');
/* eslint-disable-next-line no-unused-vars */
var damlTypes = require('@daml/types');


exports.TwoStepTransfer = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({dso: damlTypes.Party.decoder, sender: damlTypes.Party.decoder, receiver: damlTypes.Party.decoder, amount: damlTypes.Numeric(10).decoder, lockContext: damlTypes.Text.decoder, transferBefore: damlTypes.Time.decoder, transferBeforeDeadline: damlTypes.Text.decoder, provider: damlTypes.Party.decoder, allowFeaturing: damlTypes.Bool.decoder, }); }),
  encode: function (__typed__) {
  return {
    dso: damlTypes.Party.encode(__typed__.dso),
    sender: damlTypes.Party.encode(__typed__.sender),
    receiver: damlTypes.Party.encode(__typed__.receiver),
    amount: damlTypes.Numeric(10).encode(__typed__.amount),
    lockContext: damlTypes.Text.encode(__typed__.lockContext),
    transferBefore: damlTypes.Time.encode(__typed__.transferBefore),
    transferBeforeDeadline: damlTypes.Text.encode(__typed__.transferBeforeDeadline),
    provider: damlTypes.Party.encode(__typed__.provider),
    allowFeaturing: damlTypes.Bool.encode(__typed__.allowFeaturing),
  };
}
,
};

