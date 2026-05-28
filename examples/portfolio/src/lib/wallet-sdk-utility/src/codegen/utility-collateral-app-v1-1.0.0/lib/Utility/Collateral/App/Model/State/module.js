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

var pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 = require('@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0');

var Utility_Collateral_App_Types = require('../../../../../Utility/Collateral/App/Types/module');


exports.CollateralState = damlTypes.assembleTemplate(
{
  templateId: '#utility-collateral-app-v1:Utility.Collateral.App.Model.State:CollateralState',
  templateIdWithPackageId: '6bb2a795fd783646676705085d6548175783a5e63dd9084a6792cb25b32769d0:Utility.Collateral.App.Model.State:CollateralState',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({partyA: damlTypes.Party.decoder, partyB: damlTypes.Party.decoder, operator: damlTypes.Party.decoder, id: damlTypes.Text.decoder, collateralPositions: damlTypes.List(Utility_Collateral_App_Types.CollateralPosition).decoder, }); }),
  encode: function (__typed__) {
  return {
    partyA: damlTypes.Party.encode(__typed__.partyA),
    partyB: damlTypes.Party.encode(__typed__.partyB),
    operator: damlTypes.Party.encode(__typed__.operator),
    id: damlTypes.Text.encode(__typed__.id),
    collateralPositions: damlTypes.List(Utility_Collateral_App_Types.CollateralPosition).encode(__typed__.collateralPositions),
  };
}
,
  Archive: {
    template: function () { return exports.CollateralState; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.CollateralState, ['6bb2a795fd783646676705085d6548175783a5e63dd9084a6792cb25b32769d0', '#utility-collateral-app-v1']);

