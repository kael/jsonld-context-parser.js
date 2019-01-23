import {ContextParser, FetchDocumentLoader} from "../index";

describe('ContextParser', () => {
  describe('#getPrefix', () => {
    it('to return a null when no colon exists', async () => {
      expect(ContextParser.getPrefix('abc', { '//': 'abc' })).toBe(null);
    });

    it('to return a null for just a colon', async () => {
      expect(ContextParser.getPrefix(':', { '//': 'abc' })).toBe(null);
    });

    it('to return a null for double slashed suffixes', async () => {
      expect(ContextParser.getPrefix('http://abc', { '//': 'abc' })).toBe(null);
    });

    it('to return a null for blank nodes', async () => {
      expect(ContextParser.getPrefix('_:abc', { _: 'abc' })).toBe(null);
    });

    it('to return a null for a non-existing term', async () => {
      expect(ContextParser.getPrefix('abc:def', { def: 'abc' })).toBe(null);
    });

    it('to return a null for a non-existing term', async () => {
      expect(ContextParser.getPrefix('abc:def', { abc: 'ABC' })).toBe('abc');
    });
  });

  describe('#expandTerm', () => {
    describe('in vocab-mode', () => {
      it('to return when no prefix applies', async () => {
        expect(ContextParser.expandTerm('abc:123', {def: 'DEF/'}, true)).toBe('abc:123');
      });

      it('to return when no prefix applies without @id', async () => {
        expect(ContextParser.expandTerm('def:123', {def: {}}, true)).toBe('def:123');
      });

      it('to return when no term applies without @id', async () => {
        expect(ContextParser.expandTerm('def', {def: {}}, true)).toBe('def');
      });

      it('to return when a prefix applies', async () => {
        expect(ContextParser.expandTerm('def:123', {def: 'DEF/'}, true)).toBe('DEF/123');
      });

      it('to return when a prefix applies with @id', async () => {
        expect(ContextParser.expandTerm('def:123', {def: { '@id': 'DEF/' }}, true)).toBe('DEF/123');
      });

      it('to return when a direct value applies', async () => {
        expect(ContextParser.expandTerm('abc', {abc: 'DEF'}, true)).toBe('DEF');
      });

      it('to return when @vocab exists but not applies', async () => {
        expect(ContextParser.expandTerm('def:123', {'@vocab': 'bbb/'}, true)).toBe('def:123');
      });

      it('to return when @vocab exists and applies', async () => {
        expect(ContextParser.expandTerm('def', {'@vocab': 'http://bbb/'}, true))
          .toBe('http://bbb/def');
      });

      it('to return when @vocab exists and applies, but the context key references itself', async () => {
        expect(ContextParser.expandTerm('def', {'@vocab': 'http://bbb/', 'def': 'def'}, true)).
        toBe('http://bbb/def');
      });

      it('to return when @vocab exists and applies, but is disabled', async () => {
        expect(ContextParser.expandTerm('def', {'@vocab': 'bbb/', 'def': null}, true)).toBe(null);
      });

      it('to return when @vocab exists and applies, but is disabled via @id', async () => {
        expect(ContextParser.expandTerm('def', {'@vocab': 'bbb/', 'def': { '@id': null }}, true)).toBe(null);
      });

      it('to return when @base exists but not applies', async () => {
        expect(ContextParser.expandTerm('def:123', {'@base': 'bbb/'}, true)).toBe('def:123');
      });

      it('to return when @base exists and applies', async () => {
        expect(ContextParser.expandTerm('def', {'@base': 'bbb/'}, true)).toBe('def');
      });

      it('to return when @base exists and applies, but is disabled', async () => {
        expect(ContextParser.expandTerm('def', {'@base': 'bbb/', 'def': null}, true)).toBe(null);
      });

      it('to return when @base exists and applies, but is disabled via @id', async () => {
        expect(ContextParser.expandTerm('def', {'@base': 'bbb/', 'def': { '@id': null }}, true)).toBe(null);
      });
    });

    describe('in base-mode', () => {
      it('to return when no prefix applies', async () => {
        expect(ContextParser.expandTerm('abc:123', {def: 'DEF/'}, false)).toBe('abc:123');
      });

      it('to return when no prefix applies with @id', async () => {
        expect(ContextParser.expandTerm('def:123', {def: {}}, false)).toBe('def:123');
      });

      it('to return when no term applies with @id', async () => {
        expect(ContextParser.expandTerm('def', {def: {}}, false)).toBe('def');
      });

      it('to return when a prefix applies', async () => {
        expect(ContextParser.expandTerm('def:123', {def: 'DEF/'}, false)).toBe('DEF/123');
      });

      it('to return when a prefix applies with @id', async () => {
        expect(ContextParser.expandTerm('def:123', {def: { '@id': 'DEF/'} }, false)).toBe('DEF/123');
      });

      it('to return when a direct value applies, but ignore it in base-mode', async () => {
        expect(ContextParser.expandTerm('abc', {abc: 'DEF'}, false)).toBe('abc');
      });

      it('to return when @vocab exists but not applies', async () => {
        expect(ContextParser.expandTerm('def:123', {'@vocab': 'bbb/'}, false)).toBe('def:123');
      });

      it('to return when @vocab exists and applies', async () => {
        expect(ContextParser.expandTerm('def', {'@vocab': 'bbb/'}, false)).toBe('def');
      });

      it('to return when @vocab exists and applies, but is disabled', async () => {
        expect(ContextParser.expandTerm('def', {'@vocab': 'bbb/', 'def': null}, false)).toBe(null);
      });

      it('to return when @vocab exists and applies, but is disabled via @id', async () => {
        expect(ContextParser.expandTerm('def', {'@vocab': 'bbb/', 'def': { '@id': null }}, false)).toBe(null);
      });

      it('to return when @base exists but not applies', async () => {
        expect(ContextParser.expandTerm('def:123', {'@base': 'bbb/'}, false)).toBe('def:123');
      });

      it('to return when @base exists and applies', async () => {
        expect(ContextParser.expandTerm('def', {'@base': 'http://bbb/'}, false))
          .toBe('http://bbb/def');
      });

      it('to return when @base exists and applies, but is disabled', async () => {
        expect(ContextParser.expandTerm('def', {'@base': 'bbb/', 'def': null}, false)).toBe(null);
      });

      it('to return when @base exists and applies, but is disabled via @id', async () => {
        expect(ContextParser.expandTerm('def', {'@base': 'bbb/', 'def': { '@id': null }}, false)).toBe(null);
      });
    });
  });

  describe('#isPrefixValue', () => {
    it('should be false for null', async () => {
      expect(ContextParser.isPrefixValue(null)).toBeFalsy();
    });

    it('should be true for strings', async () => {
      expect(ContextParser.isPrefixValue('abc')).toBeTruthy();
    });

    it('should be true for objects with @id', async () => {
      expect(ContextParser.isPrefixValue({ '@id': 'bla' })).toBeTruthy();
    });

    it('should be true for objects with @type', async () => {
      expect(ContextParser.isPrefixValue({ '@type': 'bla' })).toBeTruthy();
    });

    it('should be false for objects without @id and @type', async () => {
      expect(ContextParser.isPrefixValue({ '@notid': 'bla' })).toBeFalsy();
    });
  });

  describe('#expandPrefixedTerms', () => {
    it('should not modify an empty context', async () => {
      expect(ContextParser.expandPrefixedTerms({})).toEqual({});
    });

    it('should not modify a context without prefixes', async () => {
      expect(ContextParser.expandPrefixedTerms({
        abc: 'def',
      })).toEqual({
        abc: 'def',
      });
    });

    it('should expand a context with string prefixes', async () => {
      expect(ContextParser.expandPrefixedTerms({
        Example: 'ex:Example',
        ex: 'http://example.org/',
      })).toEqual({
        Example: 'http://example.org/Example',
        ex: 'http://example.org/',
      });
    });

    it('should expand a context with nested string prefixes', async () => {
      expect(ContextParser.expandPrefixedTerms({
        Example: 'exabc:Example',
        ex: 'http://example.org/',
        exabc: 'ex:abc/',
      })).toEqual({
        Example: 'http://example.org/abc/Example',
        ex: 'http://example.org/',
        exabc: 'http://example.org/abc/',
      });
    });

    it('should expand a context with object @id prefixes', async () => {
      expect(ContextParser.expandPrefixedTerms({
        Example: { '@id': 'ex:Example' },
        ex: 'http://example.org/',
      })).toEqual({
        Example: { '@id': 'http://example.org/Example' },
        ex: 'http://example.org/',
      });
    });

    it('should expand a context with nested object @id prefixes', async () => {
      expect(ContextParser.expandPrefixedTerms({
        Example: { '@id': 'exabc:Example' },
        ex: 'http://example.org/',
        exabc: 'ex:abc/',
      })).toEqual({
        Example: { '@id': 'http://example.org/abc/Example' },
        ex: 'http://example.org/',
        exabc: 'http://example.org/abc/',
      });
    });

    it('should expand a context with object @type prefixes', async () => {
      expect(ContextParser.expandPrefixedTerms({
        Example: { '@type': 'ex:Example' },
        ex: 'http://example.org/',
      })).toEqual({
        Example: { '@type': 'http://example.org/Example' },
        ex: 'http://example.org/',
      });
    });

    it('should expand a context with nested object @type prefixes', async () => {
      expect(ContextParser.expandPrefixedTerms({
        Example: { '@type': 'exabc:Example' },
        ex: 'http://example.org/',
        exabc: 'ex:abc/',
      })).toEqual({
        Example: { '@type': 'http://example.org/abc/Example' },
        ex: 'http://example.org/',
        exabc: 'http://example.org/abc/',
      });
    });

    it('should expand a context with object prefixes with @id and @type', async () => {
      expect(ContextParser.expandPrefixedTerms({
        Example: { '@id': 'ex:Example', '@type': 'ex:ExampleType' },
        ex: 'http://example.org/',
      })).toEqual({
        Example: { '@id': 'http://example.org/Example', '@type': 'http://example.org/ExampleType' },
        ex: 'http://example.org/',
      });
    });

    it('should not expand object prefixes that are not @id or @type', async () => {
      expect(ContextParser.expandPrefixedTerms({
        Example: { '@id': 'ex:Example', '@bla': 'ex:Example' },
        ex: 'http://example.org/',
      })).toEqual({
        Example: { '@id': 'http://example.org/Example', '@bla': 'ex:Example' },
        ex: 'http://example.org/',
      });
    });

    it('should not expand object prefixes without @id and @type', async () => {
      expect(ContextParser.expandPrefixedTerms({
        Example: { '@bla': 'ex:Example' },
        ex: 'http://example.org/',
      })).toEqual({
        Example: { '@bla': 'ex:Example' },
        ex: 'http://example.org/',
      });
    });

    it('should expand a context with object prefixes without @id and with @type', async () => {
      expect(ContextParser.expandPrefixedTerms({
        ex: 'http://ex.org/',
        p: { '@id': 'http://ex.org/pred1', '@type': 'ex:mytype' },
      })).toEqual({
        ex: 'http://ex.org/',
        p: { '@id': 'http://ex.org/pred1', '@type': 'http://ex.org/mytype' },
      });
    });

    it('should expand a context with object prefixes with @id and without @type', async () => {
      expect(ContextParser.expandPrefixedTerms({
        ex: 'http://ex.org/',
        p: { '@id': 'ex:pred1', '@type': 'http://ex.org/mytype' },
      })).toEqual({
        ex: 'http://ex.org/',
        p: { '@id': 'http://ex.org/pred1', '@type': 'http://ex.org/mytype' },
      });
    });

    it('should not expand @language', async () => {
      expect(ContextParser.expandPrefixedTerms({
        '@base': 'http://base.org/',
        '@language': 'en',
        '@vocab': 'http://vocab.org/',
        'p': { '@id': 'pred1', '@language': 'nl' },
      })).toEqual({
        '@base': 'http://base.org/',
        '@language': 'en',
        '@vocab': 'http://vocab.org/',
        'p': { '@id': 'http://vocab.org/pred1', '@language': 'nl' },
      });
    });

    it('should expand terms based on the vocab IRI', async () => {
      expect(ContextParser.expandPrefixedTerms({
        '@base': 'http://base.org/',
        '@vocab': 'http://vocab.org/',
        'p': 'p',
      })).toEqual({
        '@base': 'http://base.org/',
        '@vocab': 'http://vocab.org/',
        'p': 'http://vocab.org/p',
      });
    });

    it('should expand nested terms based on the vocab IRI', async () => {
      expect(ContextParser.expandPrefixedTerms({
        '@base': 'http://base.org/',
        '@vocab': 'http://vocab.org/',
        'p': { '@id': 'p', '@type': 'type' },
      })).toEqual({
        '@base': 'http://base.org/',
        '@vocab': 'http://vocab.org/',
        'p': { '@id': 'http://vocab.org/p', '@type': 'http://vocab.org/type' },
      });
    });

    it('should let @type fallback to base when when vocab is disabled', async () => {
      expect(ContextParser.expandPrefixedTerms({
        '@base': 'http://base.org/',
        '@vocab': null,
        'p': { '@id': 'p', '@type': 'type' },
      })).toEqual({
        '@base': 'http://base.org/',
        '@vocab': null,
        'p': { '@id': 'p', '@type': 'http://base.org/type' },
      });
    });

    it('should let @type fallback to base when when vocab is not present', async () => {
      expect(ContextParser.expandPrefixedTerms({
        '@base': 'http://base.org/',
        'p': { '@id': 'p', '@type': 'type' },
      })).toEqual({
        '@base': 'http://base.org/',
        'p': { '@id': 'p', '@type': 'http://base.org/type' },
      });
    });

    it('should not expand @type: @vocab', async () => {
      expect(ContextParser.expandPrefixedTerms({
        '@vocab': 'http://vocab.org/',
        'p': { '@id': 'p', '@type': '@vocab' },
      })).toEqual({
        '@vocab': 'http://vocab.org/',
        'p': { '@id': 'http://vocab.org/p', '@type': '@vocab' },
      });
    });

    it('should error on aliasing of keywords', async () => {
      expect(() => ContextParser.expandPrefixedTerms({
        '@id': 'http//ex.org/id',
      })).toThrow(new Error(`Keywords can not be aliased to something else.
Tried mapping @id to http//ex.org/id`));
    });
  });

  describe('#idifyReverseTerms', () => {
    it('should not modify an empty context', async () => {
      expect(ContextParser.idifyReverseTerms({})).toEqual({});
    });

    it('should add an @id for a @reverse', async () => {
      expect(ContextParser.idifyReverseTerms({
        Example: { '@reverse': 'ex:Example' },
        ex: 'http://example.org/',
      })).toEqual({
        Example: { '@reverse': 'ex:Example', '@id': 'ex:Example' },
        ex: 'http://example.org/',
      });
    });

    it('should not add an @id for a @reverse that already has an @id', async () => {
      expect(ContextParser.idifyReverseTerms({
        Example: { '@reverse': 'ex:Example', '@id': 'ex:AnotherExample' },
        ex: 'http://example.org/',
      })).toEqual({
        Example: { '@reverse': 'ex:Example', '@id': 'ex:AnotherExample' },
        ex: 'http://example.org/',
      });
    });
  });

  describe('when instantiated without options', () => {
    let parser;

    beforeEach(() => {
      parser = new ContextParser();
    });

    it('should have a default document loader', async () => {
      expect(parser.documentLoader).toBeInstanceOf(FetchDocumentLoader);
    });
  });

  describe('when instantiated with empty options', () => {
    let parser;

    beforeEach(() => {
      parser = new ContextParser({});
    });

    it('should have a default document loader', async () => {
      expect(parser.documentLoader).toBeInstanceOf(FetchDocumentLoader);
    });
  });

  describe('when instantiated with options and a document loader', () => {
    let documentLoader;
    let parser;

    beforeEach(() => {
      documentLoader = new FetchDocumentLoader();
      parser = new ContextParser({ documentLoader });
    });

    it('should have the given document loader', async () => {
      expect(parser.documentLoader).toBe(documentLoader);
    });

    describe('for parsing URLs', () => {
      it('should parse a valid context URL', () => {
        return expect(parser.parse('http://example.org/simple.jsonld')).resolves.toEqual({
          name: "http://xmlns.com/foaf/0.1/name",
          xsd: "http://www.w3.org/2001/XMLSchema#",
        });
      });

      it('should parse and ignore the @base IRI', () => {
        return expect(parser.parse('http://example.org/base.jsonld')).resolves.toEqual({
          nickname: 'http://xmlns.com/foaf/0.1/nick',
        });
      });

      it('should parse and ignore the @base IRI, but not when a custom base IRI is given', () => {
        return expect(parser.parse('http://example.org/base.jsonld', 'abc')).resolves.toEqual({
          '@base': 'abc',
          'nickname': 'http://xmlns.com/foaf/0.1/nick',
        });
      });

      it('should parse and ignore the @base IRI, but not from the parent context', () => {
        return expect(parser.parse('http://example.org/base.jsonld', null, { '@base': 'abc' })).resolves.toEqual({
          '@base': 'abc',
          'nickname': 'http://xmlns.com/foaf/0.1/nick',
        });
      });

      it('should cache documents', async () => {
        const spy = jest.spyOn(parser.documentLoader, 'load');

        await parser.parse('http://example.org/simple.jsonld');

        expect(parser.documentCache['http://example.org/simple.jsonld']).toEqual({
          name: "http://xmlns.com/foaf/0.1/name",
          xsd: "http://www.w3.org/2001/XMLSchema#",
        });

        await expect(parser.parse('http://example.org/simple.jsonld')).resolves.toEqual({
          name: "http://xmlns.com/foaf/0.1/name",
          xsd: "http://www.w3.org/2001/XMLSchema#",
        });

        expect(spy).toHaveBeenCalledTimes(1);
      });

      it('should fail to parse an invalid source', () => {
        return expect(parser.parse('http://example.org/invalid.jsonld')).rejects.toBeTruthy();
      });
    });

    describe('for parsing null', () => {
      it('should parse to an empty context', () => {
        return expect(parser.parse(null)).resolves.toEqual({});
      });

      it('should parse to an empty context, even when a parent context is given', () => {
        return expect(parser.parse(null, null, { a: 'b' })).resolves.toEqual({});
      });

      it('should parse to an empty context, but set @base if needed', () => {
        return expect(parser.parse(null, 'http://base.org/')).resolves
          .toEqual({ '@base': 'http://base.org/' });
      });
    });

    describe('for parsing arrays', () => {
      it('should parse an empty array to the parent context', () => {
        const parentContext = { a: 'b' };
        return expect(parser.parse([], null, parentContext)).resolves.toBe(parentContext);
      });

      it('should parse an array with one string', () => {
        return expect(parser.parse([
          'http://example.org/simple.jsonld',
        ])).resolves.toEqual({
          name: "http://xmlns.com/foaf/0.1/name",
          xsd: "http://www.w3.org/2001/XMLSchema#",
        });
      });

      it('should parse an array with two strings', () => {
        return expect(parser.parse([
          'http://example.org/simple.jsonld',
          'http://example.org/simple2.jsonld',
        ])).resolves.toEqual({
          name: "http://xmlns.com/foaf/0.1/name",
          nickname: "http://xmlns.com/foaf/0.1/nick",
          xsd: "http://www.w3.org/2001/XMLSchema#",
        });
      });

      it('should parse an array with an object and a string', () => {
        return expect(parser.parse([
          {
            npmd: "https://linkedsoftwaredependencies.org/bundles/npm/",
          },
          'http://example.org/simple2.jsonld',
        ])).resolves.toEqual({
          nickname: "http://xmlns.com/foaf/0.1/nick",
          npmd: "https://linkedsoftwaredependencies.org/bundles/npm/",
        });
      });

      it('should parse and expand prefixes', () => {
        return expect(parser.parse([
          'http://example.org/simple.jsonld',
          {
            myint: { "@id": "xsd:integer" },
          },
        ])).resolves.toEqual({
          myint: { "@id": "http://www.w3.org/2001/XMLSchema#integer" },
          name: "http://xmlns.com/foaf/0.1/name",
          xsd: "http://www.w3.org/2001/XMLSchema#",
        });
      });

      it('should parse with a base IRI', () => {
        return expect(parser.parse('http://example.org/simple.jsonld', 'http://myexample.org/'))
          .resolves.toEqual({
            '@base': 'http://myexample.org/',
            'name': "http://xmlns.com/foaf/0.1/name",
            'xsd': "http://www.w3.org/2001/XMLSchema#",
          });
      });

      it('should parse with a base IRI and not override the inner @base', () => {
        return expect(parser.parse({ '@base': 'http://myotherexample.org/' }, 'http://myexample.org/'))
          .resolves.toEqual({
            '@base': 'http://myotherexample.org/',
          });
      });

      it('should parse a complex context', () => {
        // tslint:disable:object-literal-sort-keys
        // tslint:disable:max-line-length
        return expect(parser.parse('http://example.org/complex.jsonld')).resolves.toEqual({
          "@vocab": "unknown://",
          "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
          "xsd": "http://www.w3.org/2001/XMLSchema#",
          "oo": "https://linkedsoftwaredependencies.org/vocabularies/object-oriented#",
          "Module": {
            "@id": "https://linkedsoftwaredependencies.org/vocabularies/object-oriented#Module",
          },
          "Class": {
            "@id": "https://linkedsoftwaredependencies.org/vocabularies/object-oriented#Class",
          },
          "AbstractClass": {
            "@id": "https://linkedsoftwaredependencies.org/vocabularies/object-oriented#AbstractClass",
          },
          "Instance": {
            "@id": "https://linkedsoftwaredependencies.org/vocabularies/object-oriented#ComponentInstance",
          },
          "components": {
            "@id": "https://linkedsoftwaredependencies.org/vocabularies/object-oriented#component",
          },
          "parameters": {
            "@id": "https://linkedsoftwaredependencies.org/vocabularies/object-oriented#parameter",
          },
          "constructorArguments": {
            "@id": "https://linkedsoftwaredependencies.org/vocabularies/object-oriented#constructorArguments",
            "@container": "@list",
          },
          "unique": {
            "@id": "https://linkedsoftwaredependencies.org/vocabularies/object-oriented#uniqueValue",
          },
          "required": {
            "@id": "https://linkedsoftwaredependencies.org/vocabularies/object-oriented#required",
          },
          "default": {
            "@id": "https://linkedsoftwaredependencies.org/vocabularies/object-oriented#defaultValue",
          },
          "defaultScoped": {
            "@id": "https://linkedsoftwaredependencies.org/vocabularies/object-oriented#defaultScoped",
          },
          "defaultScope": {
            "@id": "https://linkedsoftwaredependencies.org/vocabularies/object-oriented#defaultScope",
            "@type": "@id",
          },
          "defaultScopedValue": {
            "@id": "https://linkedsoftwaredependencies.org/vocabularies/object-oriented#defaultScopedValue",
          },
          "arguments": {
            "@id": "https://linkedsoftwaredependencies.org/vocabularies/object-oriented#arguments",
            "@container": "@list",
          },
          "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
          "comment": {
            "@id": "http://www.w3.org/2000/01/rdf-schema#comment",
            "@type": "@id",
          },
          "extends": {
            "@id": "http://www.w3.org/2000/01/rdf-schema#subClassOf",
            "@type": "@id",
          },
          "range": {
            "@id": "http://www.w3.org/2000/01/rdf-schema#range",
            "@type": "@id",
          },
          "owl": "http://www.w3.org/2002/07/owl#",
          "import": {
            "@id": "http://www.w3.org/2002/07/owl#imports",
          },
          "InheritanceValue": {
            "@id": "http://www.w3.org/2002/07/owl#Restriction",
          },
          "inheritValues": {
            "@id": "http://www.w3.org/2000/01/rdf-schema#subClassOf",
            "@type": "@id",
          },
          "onParameter": {
            "@id": "http://www.w3.org/2002/07/owl#onProperty",
            "@type": "@id",
          },
          "from": {
            "@id": "http://www.w3.org/2002/07/owl#allValuesFrom",
            "@type": "@id",
          },
          "doap": "http://usefulinc.com/ns/doap#",
          "requireName": {
            "@id": "http://usefulinc.com/ns/doap#name",
          },
          "requireElement": {
            "@id": "https://linkedsoftwaredependencies.org/vocabularies/object-oriented#componentPath",
          },
          "om": "https://linkedsoftwaredependencies.org/vocabularies/object-mapping#",
          "ObjectMapping": {
            "@id": "https://linkedsoftwaredependencies.org/vocabularies/object-mapping#ObjectMapping",
          },
          "ArrayMapping": {
            "@id": "https://linkedsoftwaredependencies.org/vocabularies/object-mapping#ArrayMapping",
          },
          "fields": {
            "@id": "https://linkedsoftwaredependencies.org/vocabularies/object-mapping#field",
            "@type": "https://linkedsoftwaredependencies.org/vocabularies/object-mapping#ObjectMapEntry",
          },
          "elements": {
            "@id": "https://linkedsoftwaredependencies.org/vocabularies/object-mapping#elements",
            "@type": "@id",
            "@container": "@list",
          },
          "collectEntries": {
            "@id": "https://linkedsoftwaredependencies.org/vocabularies/object-mapping#collectsEntriesFrom",
            "@type": "@id",
          },
          "keyRaw": {
            "@id": "https://linkedsoftwaredependencies.org/vocabularies/object-mapping#fieldName",
          },
          "key": {
            "@id": "https://linkedsoftwaredependencies.org/vocabularies/object-mapping#fieldName",
            "@type": "@id",
          },
          "value": {
            "@id": "https://linkedsoftwaredependencies.org/vocabularies/object-mapping#fieldValue",
            "@type": "@id",
          },
          "valueRaw": {
            "@id": "https://linkedsoftwaredependencies.org/vocabularies/object-mapping#fieldValue",
          },
          "valueRawReference": {
            "@id": "https://linkedsoftwaredependencies.org/vocabularies/object-mapping#fieldValueRaw",
            "@type": "@id",
          },
          "npmd": "https://linkedsoftwaredependencies.org/bundles/npm/",
          "cais": "https://linkedsoftwaredependencies.org/bundles/npm/@comunica/actor-init-sparql/",
          "ActorInitSparql": "https://linkedsoftwaredependencies.org/bundles/npm/@comunica/actor-init-sparql/Actor/Init/Sparql",
          "mediatorQueryOperation": "https://linkedsoftwaredependencies.org/bundles/npm/@comunica/actor-init-sparql/mediatorQueryOperation",
          "mediatorSparqlParse": "https://linkedsoftwaredependencies.org/bundles/npm/@comunica/actor-init-sparql/mediatorSparqlParse",
          "mediatorSparqlSerialize": "https://linkedsoftwaredependencies.org/bundles/npm/@comunica/actor-init-sparql/mediatorSparqlSerialize",
          "mediatorSparqlSerializeMediaTypeCombiner": "https://linkedsoftwaredependencies.org/bundles/npm/@comunica/actor-init-sparql/mediatorSparqlSerializeMediaTypeCombiner",
          "mediatorContextPreprocess": "https://linkedsoftwaredependencies.org/bundles/npm/@comunica/actor-init-sparql/mediatorContextPreprocess",
        });
        // tslint:enable:object-literal-sort-keys
        // tslint:enable:max-line-length
      });
    });

    describe('for parsing invalid values', () => {
      it('should error when parsing true', () => {
        return expect(parser.parse(true)).rejects
          .toEqual(new Error('Tried parsing a context that is not a string, array or object, but got true'));
      });

      it('should error when parsing false', () => {
        return expect(parser.parse(false)).rejects
          .toEqual(new Error('Tried parsing a context that is not a string, array or object, but got false'));
      });

      it('should error when parsing a number', () => {
        return expect(parser.parse(1)).rejects
          .toEqual(new Error('Tried parsing a context that is not a string, array or object, but got 1'));
      });
    });
  });
});
