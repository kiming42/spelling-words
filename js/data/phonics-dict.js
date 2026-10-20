/* =========================================================
   靜態資料庫 3：Phonics IPA 國際音標字典與拆音節演算法
   ========================================================= */
const PHONICS_IPA_DICT = {
  'arrive':       [{ t: 'ar', ipa: 'ə', ph: 'uh' }, { t: 'rive', ipa: 'raɪv', ph: 'raiv' }],
  'school':       [{ t: 'school', ipa: 'skuːl', ph: 'skool' }],
  'early':        [{ t: 'ear', ipa: 'ɜː', ph: 'er' }, { t: 'ly', ipa: 'li', ph: 'lee' }],
  'late':         [{ t: 'late', ipa: 'leɪt', ph: 'leit' }],
  'dress':        [{ t: 'dress', ipa: 'dres', ph: 'dres' }],
  'wait':         [{ t: 'wait', ipa: 'weɪt', ph: 'weit' }],
  'eat':          [{ t: 'eat', ipa: 'iːt', ph: 'eet' }],
  'speak':        [{ t: 'speak', ipa: 'spiːk', ph: 'speek' }],
  'rudely':       [{ t: 'rude', ipa: 'ruːd', ph: 'rood' }, { t: 'ly', ipa: 'li', ph: 'lee' }],
  'softly':       [{ t: 'soft', ipa: 'sɒft', ph: 'soft' }, { t: 'ly', ipa: 'li', ph: 'lee' }],
  'loudly':       [{ t: 'loud', ipa: 'laʊd', ph: 'laud' }, { t: 'ly', ipa: 'li', ph: 'lee' }],
  'offer':        [{ t: 'of', ipa: 'ɒf', ph: 'of' }, { t: 'fer', ipa: 'ə', ph: 'fer' }],
  'other':        [{ t: 'oth', ipa: 'ʌð', ph: 'uth' }, { t: 'er', ipa: 'ə', ph: 'er' }],
  'argue':        [{ t: 'ar', ipa: 'ɑː', ph: 'ah' }, { t: 'gue', ipa: 'ɡjuː', ph: 'gyoo' }],
  'discuss':      [{ t: 'dis', ipa: 'dɪ', ph: 'dis' }, { t: 'cuss', ipa: 'skʌs', ph: 'kus' }],
  'agree':        [{ t: 'a', ipa: 'ə', ph: 'uh' }, { t: 'gree', ipa: 'ɡriː', ph: 'gree' }],
  'sorry':        [{ t: 'sor', ipa: 'sɒr', ph: 'sor' }, { t: 'ry', ipa: 'i', ph: 'ree' }],
  'indoor':       [{ t: 'in', ipa: 'ɪn', ph: 'in' }, { t: 'door', ipa: 'dɔː', ph: 'dor' }],
  'public':       [{ t: 'pub', ipa: 'pʌb', ph: 'pub' }, { t: 'lic', ipa: 'lɪk', ph: 'lik' }],
  'online':       [{ t: 'on', ipa: 'ɒn', ph: 'on' }, { t: 'line', ipa: 'laɪn', ph: 'lain' }],
  'video':        [{ t: 'vid', ipa: 'vɪd', ph: 'vid' }, { t: 'e', ipa: 'i', ph: 'ee' }, { t: 'o', ipa: 'əʊ', ph: 'oh' }],
  'untidily':     [{ t: 'un', ipa: 'ʌn', ph: 'uhn' }, { t: 'ti', ipa: 'taɪ', ph: 'tai' }, { t: 'di', ipa: 'dɪ', ph: 'dih' }, { t: 'ly', ipa: 'li', ph: 'lee' }],
  'tidily':       [{ t: 'ti', ipa: 'taɪ', ph: 'tai' }, { t: 'di', ipa: 'dɪ', ph: 'dih' }, { t: 'ly', ipa: 'li', ph: 'lee' }],
  'disappointed': [{ t: 'dis', ipa: 'dɪs', ph: 'dis' }, { t: 'ap', ipa: 'ə', ph: 'uh' }, { t: 'poin', ipa: 'pɔɪn', ph: 'poin' }, { t: 'ted', ipa: 'tɪd', ph: 'tid' }],
  'embarrassed':  [{ t: 'em', ipa: 'ɪm', ph: 'im' }, { t: 'bar', ipa: 'bæ', ph: 'ba' }, { t: 'rassed', ipa: 'rəst', ph: 'rust' }],
  'impatiently':  [{ t: 'im', ipa: 'ɪm', ph: 'im' }, { t: 'pa', ipa: 'peɪ', ph: 'pei' }, { t: 'tient', ipa: 'ʃənt', ph: 'shunt' }, { t: 'ly', ipa: 'li', ph: 'lee' }],
  'patiently':    [{ t: 'pa', ipa: 'peɪ', ph: 'pei' }, { t: 'tient', ipa: 'ʃənt', ph: 'shunt' }, { t: 'ly', ipa: 'li', ph: 'lee' }],
  'politely':     [{ t: 'po', ipa: 'pə', ph: 'puh' }, { t: 'lite', ipa: 'laɪt', ph: 'lait' }, { t: 'ly', ipa: 'li', ph: 'lee' }],
  'quietly':      [{ t: 'qui', ipa: 'kwaɪ', ph: 'kwai' }, { t: 'et', ipa: 'ət', ph: 'uht' }, { t: 'ly', ipa: 'li', ph: 'lee' }],
  'noisily':      [{ t: 'noi', ipa: 'nɔɪ', ph: 'noi' }, { t: 'si', ipa: 'zɪ', ph: 'zih' }, { t: 'ly', ipa: 'li', ph: 'lee' }],
  'passengers':   [{ t: 'pas', ipa: 'pæs', ph: 'pas' }, { t: 'sen', ipa: 'sən', ph: 'sun' }, { t: 'gers', ipa: 'dʒəz', ph: 'jerz' }],
  'disagree':     [{ t: 'dis', ipa: 'dɪs', ph: 'dis' }, { t: 'a', ipa: 'ə', ph: 'uh' }, { t: 'gree', ipa: 'ɡriː', ph: 'gree' }],
  'quarrel':      [{ t: 'quar', ipa: 'kwɒ', ph: 'kwo' }, { t: 'rel', ipa: 'rəl', ph: 'rul' }],
  'jealous':      [{ t: 'jeal', ipa: 'dʒe', ph: 'je' }, { t: 'ous', ipa: 'ləs', ph: 'lus' }],
  'puzzled':      [{ t: 'puz', ipa: 'pʌ', ph: 'puh' }, { t: 'zled', ipa: 'zəld', ph: 'zuld' }],
  'annoyed':      [{ t: 'an', ipa: 'ə', ph: 'uh' }, { t: 'noyed', ipa: 'nɔɪd', ph: 'noid' }],
  'shocked':      [{ t: 'shock', ipa: 'ʃɒk', ph: 'shok' }, { t: 'ed', ipa: 't', ph: 't' }],
  'upset':        [{ t: 'up', ipa: 'ʌp', ph: 'uhp' }, { t: 'set', ipa: 'set', ph: 'set' }],
  'conservation': [{ t: 'con', ipa: 'kɒn', ph: 'kon' }, { t: 'ser', ipa: 'sə', ph: 'ser' }, { t: 'va', ipa: 'veɪ', ph: 'vei' }, { t: 'tion', ipa: 'ʃən', ph: 'shun' }],
  'endangered':   [{ t: 'en', ipa: 'ɪn', ph: 'in' }, { t: 'dan', ipa: 'deɪn', ph: 'dein' }, { t: 'gered', ipa: 'dʒəd', ph: 'jerd' }],
  'interrupted':  [{ t: 'in', ipa: 'ɪn', ph: 'in' }, { t: 'ter', ipa: 'tə', ph: 'ter' }, { t: 'rup', ipa: 'rʌp', ph: 'rup' }, { t: 'ted', ipa: 'tɪd', ph: 'tid' }],
  'connection':   [{ t: 'con', ipa: 'kə', ph: 'kuh' }, { t: 'nec', ipa: 'nek', ph: 'nek' }, { t: 'tion', ipa: 'ʃən', ph: 'shun' }],
  'presenter':    [{ t: 'pre', ipa: 'prɪ', ph: 'prih' }, { t: 'sen', ipa: 'zen', ph: 'zen' }, { t: 'ter', ipa: 'tə', ph: 'ter' }],
  'predator':     [{ t: 'pred', ipa: 'pred', ph: 'pred' }, { t: 'a', ipa: 'ə', ph: 'uh' }, { t: 'tor', ipa: 'tə', ph: 'ter' }],
  'attitude':     [{ t: 'at', ipa: 'æt', ph: 'at' }, { t: 'ti', ipa: 'tɪ', ph: 'tih' }, { t: 'tude', ipa: 'tjuːd', ph: 'tyood' }],
  'habitat':      [{ t: 'hab', ipa: 'hæb', ph: 'hab' }, { t: 'i', ipa: 'ɪ', ph: 'ih' }, { t: 'tat', ipa: 'tæt', ph: 'tat' }],
  'navigate':     [{ t: 'nav', ipa: 'næv', ph: 'nav' }, { t: 'i', ipa: 'ɪ', ph: 'ih' }, { t: 'gate', ipa: 'ɡeɪt', ph: 'geit' }],
  'develop':      [{ t: 'de', ipa: 'dɪ', ph: 'dih' }, { t: 'vel', ipa: 'vel', ph: 'vel' }, { t: 'op', ipa: 'əp', ph: 'uhp' }],
  'observe':      [{ t: 'ob', ipa: 'əb', ph: 'uhb' }, { t: 'serve', ipa: 'zɜːv', ph: 'zerv' }],
  'progress':     [{ t: 'pro', ipa: 'prəʊ', ph: 'proh' }, { t: 'gress', ipa: 'ɡres', ph: 'gres' }],
  'relieved':     [{ t: 're', ipa: 'rɪ', ph: 'rih' }, { t: 'lieved', ipa: 'liːvd', ph: 'leevd' }],
  'succeed':      [{ t: 'suc', ipa: 'sək', ph: 'suk' }, { t: 'ceed', ipa: 'siːd', ph: 'seed' }],
  'resist':       [{ t: 're', ipa: 'rɪ', ph: 'rih' }, { t: 'sist', ipa: 'zɪst', ph: 'zist' }],
  'extinct':      [{ t: 'ex', ipa: 'ɪk', ph: 'ik' }, { t: 'tinct', ipa: 'stɪŋkt', ph: 'stinkt' }],
  'species':      [{ t: 'spe', ipa: 'spiː', ph: 'spee' }, { t: 'cies', ipa: 'ʃiːz', ph: 'sheez' }],
  'open-minded':  [{ t: 'o', ipa: 'əʊ', ph: 'oh' }, { t: 'pen', ipa: 'pən', ph: 'pun' }, { t: 'min', ipa: 'maɪn', ph: 'main' }, { t: 'ded', ipa: 'dɪd', ph: 'did' }],
  'openminded':   [{ t: 'o', ipa: 'əʊ', ph: 'oh' }, { t: 'pen', ipa: 'pən', ph: 'pun' }, { t: 'min', ipa: 'maɪn', ph: 'main' }, { t: 'ded', ipa: 'dɪd', ph: 'did' }],
  'protect':      [{ t: 'pro', ipa: 'prə', ph: 'pruh' }, { t: 'tect', ipa: 'tekt', ph: 'tekt' }],
  'steady':       [{ t: 'stea', ipa: 'ste', ph: 'ste' }, { t: 'dy', ipa: 'di', ph: 'dee' }],
  'barely':       [{ t: 'bare', ipa: 'beə', ph: 'bair' }, { t: 'ly', ipa: 'li', ph: 'lee' }],
  'reality':      [{ t: 're', ipa: 'ri', ph: 'ree' }, { t: 'al', ipa: 'æ', ph: 'al' }, { t: 'i', ipa: 'lɪ', ph: 'ih' }, { t: 'ty', ipa: 'ti', ph: 'tee' }],
  'aim':          [{ t: 'aim', ipa: 'eɪm', ph: 'eim' }],
  'prey':         [{ t: 'prey', ipa: 'preɪ', ph: 'prei' }],
  'fail':         [{ t: 'fail', ipa: 'feɪl', ph: 'feil' }],
  'playground':   [{ t: 'play', ipa: 'pleɪ', ph: 'plei' }, { t: 'ground', ipa: 'ɡraʊnd', ph: 'graund' }],
  'volleyball':   [{ t: 'vol', ipa: 'vɒ', ph: 'vol' }, { t: 'ley', ipa: 'li', ph: 'lee' }, { t: 'ball', ipa: 'bɔːl', ph: 'bawl' }],
  'newspaper':    [{ t: 'news', ipa: 'njuːz', ph: 'nyooz' }, { t: 'pa', ipa: 'peɪ', ph: 'pei' }, { t: 'per', ipa: 'pə', ph: 'per' }],
  'magazines':    [{ t: 'mag', ipa: 'mæɡ', ph: 'mag' }, { t: 'a', ipa: 'ə', ph: 'uh' }, { t: 'zines', ipa: 'ziːnz', ph: 'zeenz' }],
  'library':      [{ t: 'li', ipa: 'laɪ', ph: 'lai' }, { t: 'bra', ipa: 'brə', ph: 'bruh' }, { t: 'ry', ipa: 'ri', ph: 'ree' }],
  'climbing':     [{ t: 'climb', ipa: 'klaɪm', ph: 'klaim' }, { t: 'ing', ipa: 'ɪŋ', ph: 'ing' }],
  'cycling':      [{ t: 'cy', ipa: 'saɪ', ph: 'sai' }, { t: 'cling', ipa: 'klɪŋ', ph: 'kling' }],
  'skating':      [{ t: 'ska', ipa: 'skeɪ', ph: 'skei' }, { t: 'ting', ipa: 'tɪŋ', ph: 'ting' }],
  'iceskating':   [{ t: 'ice', ipa: 'aɪs', ph: 'ais' }, { t: 'ska', ipa: 'skeɪ', ph: 'skei' }, { t: 'ting', ipa: 'tɪŋ', ph: 'ting' }],
  'jogging':      [{ t: 'jog', ipa: 'dʒɒɡ', ph: 'jog' }, { t: 'ging', ipa: 'ɪŋ', ph: 'ing' }],
  'tennis':       [{ t: 'ten', ipa: 'ten', ph: 'ten' }, { t: 'nis', ipa: 'ɪs', ph: 'nis' }],
  'sandals':      [{ t: 'san', ipa: 'sæn', ph: 'san' }, { t: 'dals', ipa: 'dəlz', ph: 'dulz' }],
  'mittens':      [{ t: 'mit', ipa: 'mɪt', ph: 'mit' }, { t: 'tens', ipa: 'ənz', ph: 'unz' }],
  'glasses':      [{ t: 'glas', ipa: 'ɡlɑːs', ph: 'glas' }, { t: 'ses', ipa: 'ɪz', ph: 'iz' }],
  'sunglasses':   [{ t: 'sun', ipa: 'sʌn', ph: 'sun' }, { t: 'glas', ipa: 'ɡlɑːs', ph: 'glas' }, { t: 'ses', ipa: 'ɪz', ph: 'iz' }],
  'curly':        [{ t: 'cur', ipa: 'kɜː', ph: 'ker' }, { t: 'ly', ipa: 'li', ph: 'lee' }],
  'blonde':       [{ t: 'blonde', ipa: 'blɒnd', ph: 'blond' }],
  'straight':     [{ t: 'straight', ipa: 'streɪt', ph: 'streit' }]
};

const FALLBACK_SYLLABLE_IPA = {
  'un': { ipa: 'ʌn', ph: 'uhn' },
  'in': { ipa: 'ɪn', ph: 'in' },
  'im': { ipa: 'ɪm', ph: 'im' },
  'dis': { ipa: 'dɪs', ph: 'dis' },
  're': { ipa: 'rɪ', ph: 'rih' },
  'pre': { ipa: 'prɪ', ph: 'prih' },
  'pro': { ipa: 'prə', ph: 'pruh' },
  'con': { ipa: 'kɒn', ph: 'kon' },
  'de': { ipa: 'dɪ', ph: 'dih' },
  'ex': { ipa: 'ɪks', ph: 'iks' },
  'ob': { ipa: 'ɒb', ph: 'ob' },
  'sub': { ipa: 'sʌb', ph: 'sub' },
  'ap': { ipa: 'æp', ph: 'uhp' },
  'at': { ipa: 'æt', ph: 'at' },
  'up': { ipa: 'ʌp', ph: 'uhp' },
  'em': { ipa: 'ɪm', ph: 'im' },
  'en': { ipa: 'ɪn', ph: 'in' },
  'er': { ipa: 'ɜː', ph: 'er' },
  'ing': { ipa: 'ɪŋ', ph: 'ing' },
  'ed': { ipa: 'ɪd', ph: 'id' },
  'ly': { ipa: 'li', ph: 'lee' },
  'ty': { ipa: 'ti', ph: 'tee' },
  'ry': { ipa: 'ri', ph: 'ree' },
  'tion': { ipa: 'ʃən', ph: 'shun' },
  'sion': { ipa: 'ʒən', ph: 'zhun' },
  'ture': { ipa: 'tʃə', ph: 'cher' },
  'ous': { ipa: 'əs', ph: 'uhs' }
};

function splitSingleWordToSyllables(singleWord) {
  if (PHONICS_IPA_DICT[singleWord]) {
    return PHONICS_IPA_DICT[singleWord].map(s => ({ ...s }));
  }
  if (singleWord.length <= 4) {
    const fb = FALLBACK_SYLLABLE_IPA[singleWord];
    return [{ t: singleWord, ipa: fb ? fb.ipa : null, ph: fb ? fb.ph : singleWord }];
  }
  const regex = /[^aeiouy]*[aeiouy]+(?:[^aeiouy]*$|[^aeiouy](?=[^aeiouy]))?/gi;
  const parts = singleWord.match(regex) || [singleWord];
  return parts.map(p => {
    const fb = FALLBACK_SYLLABLE_IPA[p];
    return { t: p, ipa: fb ? fb.ipa : null, ph: fb ? fb.ph : p };
  });
}

function getWordSyllableObjects(wordOrPhrase) {
  const clean = wordOrPhrase.toLowerCase().trim();
  const words = clean.split(/\s+/);
  let out = [];
  words.forEach((w, wIdx) => {
    const syls = splitSingleWordToSyllables(w);
    syls.forEach((s, sIdx) => {
      out.push({
        t: s.t,
        ipa: s.ipa,
        ph: s.ph || s.t,
        spaceAfter: (sIdx === syls.length - 1) && (wIdx < words.length - 1)
      });
    });
  });
  return out;
}
