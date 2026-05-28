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

var pkg5aee9b21b8e9a4c4975b5f4c4198e6e6e8469df49e2010820e792f393db870f4 = require('@daml.js/daml-prim-DA-Types-1.0.0');
var pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 = require('@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0');
var pkgc3bb0c5d04799b3f11bad7c3c102963e115cf53da3e4afcbcfd9f06ebd82b4ff = require('@daml.js/daml-stdlib-DA-Set-Types-1.0.0');


exports.PartyCredentialRequirement = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({issuer: damlTypes.Party.decoder, requiredClaims: damlTypes.List(pkg5aee9b21b8e9a4c4975b5f4c4198e6e6e8469df49e2010820e792f393db870f4.DA.Types.Tuple2(damlTypes.Text, damlTypes.Text)).decoder, }); }),
  encode: function (__typed__) {
  return {
    issuer: damlTypes.Party.encode(__typed__.issuer),
    requiredClaims: damlTypes.List(pkg5aee9b21b8e9a4c4975b5f4c4198e6e6e8469df49e2010820e792f393db870f4.DA.Types.Tuple2(damlTypes.Text, damlTypes.Text)).encode(__typed__.requiredClaims),
  };
}
,
};



exports.WithIssuerHolder = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({issuer: damlTypes.Party.decoder, holder: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    issuer: damlTypes.Party.encode(__typed__.issuer),
    holder: damlTypes.Party.encode(__typed__.holder),
  };
}
,
};



exports.WithIssuer = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({issuer: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    issuer: damlTypes.Party.encode(__typed__.issuer),
  };
}
,
};



exports.Credential_Revoke_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.Credential_Get_Result = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({credential: exports.Credential.decoder, }); }),
  encode: function (__typed__) {
  return {
    credential: exports.Credential.encode(__typed__.credential),
  };
}
,
};



exports.Credential_Revoke = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({actor: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    actor: damlTypes.Party.encode(__typed__.actor),
  };
}
,
};



exports.Credential_Get = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({actor: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    actor: damlTypes.Party.encode(__typed__.actor),
  };
}
,
};



exports.Credential = damlTypes.assembleTemplate(
{
  templateId: '#utility-credential-v0:Utility.Credential.V0.Credential:Credential',
  templateIdWithPackageId: '5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70:Utility.Credential.V0.Credential:Credential',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({issuer: damlTypes.Party.decoder, holder: damlTypes.Party.decoder, id: damlTypes.Text.decoder, description: damlTypes.Text.decoder, validFrom: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Time).decoder), validUntil: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Time).decoder), claims: damlTypes.List(exports.Claim).decoder, observers: pkgc3bb0c5d04799b3f11bad7c3c102963e115cf53da3e4afcbcfd9f06ebd82b4ff.DA.Set.Types.Set(damlTypes.Party).decoder, }); }),
  encode: function (__typed__) {
  return {
    issuer: damlTypes.Party.encode(__typed__.issuer),
    holder: damlTypes.Party.encode(__typed__.holder),
    id: damlTypes.Text.encode(__typed__.id),
    description: damlTypes.Text.encode(__typed__.description),
    validFrom: damlTypes.Optional(damlTypes.Time).encode(__typed__.validFrom),
    validUntil: damlTypes.Optional(damlTypes.Time).encode(__typed__.validUntil),
    claims: damlTypes.List(exports.Claim).encode(__typed__.claims),
    observers: pkgc3bb0c5d04799b3f11bad7c3c102963e115cf53da3e4afcbcfd9f06ebd82b4ff.DA.Set.Types.Set(damlTypes.Party).encode(__typed__.observers),
  };
}
,
  Credential_Revoke: {
    template: function () { return exports.Credential; },
    choiceName: 'Credential_Revoke',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.Credential_Revoke.decoder; }),
    argumentEncode: function (__typed__) { return exports.Credential_Revoke.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.Credential_Revoke_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.Credential_Revoke_Result.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.Credential; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  Credential_Get: {
    template: function () { return exports.Credential; },
    choiceName: 'Credential_Get',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.Credential_Get.decoder; }),
    argumentEncode: function (__typed__) { return exports.Credential_Get.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return exports.Credential_Get_Result.decoder; }),
    resultEncode: function (__typed__) { return exports.Credential_Get_Result.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.Credential, ['5a29ead611a0abd5f5b3fc3caf7d0f67c0ff802032ab6d392824aa9060e56d70', '#utility-credential-v0']);



exports.Claim = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({subject: damlTypes.Text.decoder, property: damlTypes.Text.decoder, value: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    subject: damlTypes.Text.encode(__typed__.subject),
    property: damlTypes.Text.encode(__typed__.property),
    value: damlTypes.Text.encode(__typed__.value),
  };
}
,
};

