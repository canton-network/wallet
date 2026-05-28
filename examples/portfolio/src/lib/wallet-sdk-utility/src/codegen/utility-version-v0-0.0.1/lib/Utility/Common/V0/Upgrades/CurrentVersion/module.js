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


exports.CurrentVersion_Update_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({newCurrentVersionCid: damlTypes.ContractId(exports.CurrentVersion).decoder, }); }),
  encode: function (__typed__) {
  return {
    newCurrentVersionCid: damlTypes.ContractId(exports.CurrentVersion).encode(__typed__.newCurrentVersionCid),
  };
}
,
};



exports.CurrentVersion_InUse = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({newPackageIdInUse: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    newPackageIdInUse: damlTypes.Text.encode(__typed__.newPackageIdInUse),
  };
}
,
};



exports.CurrentVersion_UpdatePackageId = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({newPackageId: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    newPackageId: damlTypes.Text.encode(__typed__.newPackageId),
  };
}
,
};



exports.CurrentVersion = damlTypes.assembleTemplate(
{
  templateId: '#utility-version-v0:Utility.Common.V0.Upgrades.CurrentVersion:CurrentVersion',
  templateIdWithPackageId: '42e902610f593c6fb5516d7a7401ad0892dc44507a777ace0a468a5f6c9d3381:Utility.Common.V0.Upgrades.CurrentVersion:CurrentVersion',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({operator: damlTypes.Party.decoder, user: damlTypes.Party.decoder, packageName: damlTypes.Text.decoder, packageId: damlTypes.Text.decoder, packageIdInUse: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Text).decoder), }); }),
  encode: function (__typed__) {
  return {
    operator: damlTypes.Party.encode(__typed__.operator),
    user: damlTypes.Party.encode(__typed__.user),
    packageName: damlTypes.Text.encode(__typed__.packageName),
    packageId: damlTypes.Text.encode(__typed__.packageId),
    packageIdInUse: damlTypes.Optional(damlTypes.Text).encode(__typed__.packageIdInUse),
  };
}
,
  CurrentVersion_UpdatePackageId: {
    template: function () { return exports.CurrentVersion; },
    choiceName: 'CurrentVersion_UpdatePackageId',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.CurrentVersion_UpdatePackageId.decoder; }),
    argumentEncode: function (__typed__) { return exports.CurrentVersion_UpdatePackageId.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.CurrentVersion_Update_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.CurrentVersion_Update_Result.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.CurrentVersion; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  CurrentVersion_InUse: {
    template: function () { return exports.CurrentVersion; },
    choiceName: 'CurrentVersion_InUse',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.CurrentVersion_InUse.decoder; }),
    argumentEncode: function (__typed__) { return exports.CurrentVersion_InUse.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.CurrentVersion_Update_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.CurrentVersion_Update_Result.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.CurrentVersion, ['42e902610f593c6fb5516d7a7401ad0892dc44507a777ace0a468a5f6c9d3381', '#utility-version-v0']);

