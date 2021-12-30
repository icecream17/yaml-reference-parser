// Generated by CoffeeScript 2.5.1
(function() {
  var Receiver, alias_event, cache, document_end_event, document_start_event, mapping_end_event, mapping_start_event, scalar_event, sequence_end_event, sequence_start_event, stream_end_event, stream_start_event;

  require('./prelude');

  stream_start_event = function() {
    return {
      event: 'stream_start'
    };
  };

  stream_end_event = function() {
    return {
      event: 'stream_end'
    };
  };

  document_start_event = function(explicit = false) {
    return {
      event: 'document_start',
      explicit: explicit,
      version: null
    };
  };

  document_end_event = function(explicit = false) {
    return {
      event: 'document_end',
      explicit: explicit
    };
  };

  mapping_start_event = function(flow = false) {
    return {
      event: 'mapping_start',
      flow: flow
    };
  };

  mapping_end_event = function() {
    return {
      event: 'mapping_end'
    };
  };

  sequence_start_event = function(flow = false) {
    return {
      event: 'sequence_start',
      flow: flow
    };
  };

  sequence_end_event = function() {
    return {
      event: 'sequence_end'
    };
  };

  scalar_event = function(style, value) {
    return {
      event: 'scalar',
      style: style,
      value: value
    };
  };

  alias_event = function(name) {
    return {
      event: 'alias',
      name: name
    };
  };

  cache = function(text) {
    return {
      text: text
    };
  };

  module.exports = global.Receiver = Receiver = (function() {
    var end1, end2, hex, hex2, hex4, hex8, unescapes;

    class Receiver {
      constructor() {
        this.event = [];
        this.cache = [];
      }

      send(event) {
        if (this.receive) {
          return this.receive(event);
        } else {
          return this.event.push(event);
        }
      }

      add(event) {
        if (event.event != null) {
          if (this.anchor != null) {
            event.anchor = this.anchor;
            delete this.anchor;
          }
          if (this.tag != null) {
            event.tag = this.tag;
            delete this.tag;
          }
        }
        this.push(event);
        return event;
      }

      push(event) {
        if (this.cache.length) {
          return _.last(this.cache).push(event);
        } else {
          if (event.event.match(/(mapping_start|sequence_start|scalar)/)) {
            this.check_document_start();
          }
          return this.send(event);
        }
      }

      cache_up(event = null) {
        this.cache.push([]);
        if (event != null) {
          return this.add(event);
        }
      }

      cache_down(event = null) {
        var e, events, i, len;
        events = this.cache.pop() || FAIL('cache_down');
        for (i = 0, len = events.length; i < len; i++) {
          e = events[i];
          this.push(e);
        }
        if (event != null) {
          return this.add(event);
        }
      }

      cache_drop() {
        var events;
        events = this.cache.pop() || FAIL('cache_drop');
        return events;
      }

      cache_get(type) {
        var last;
        last = _.last(this.cache);
        return last && last[0] && last[0].event === type && last[0];
      }

      check_document_start() {
        if (!this.document_start) {
          return;
        }
        this.send(this.document_start);
        delete this.document_start;
        return this.document_end = document_end_event();
      }

      check_document_end() {
        if (!this.document_end) {
          return;
        }
        this.send(this.document_end);
        delete this.document_end;
        this.tag_map = {};
        return this.document_start = document_start_event();
      }

      //----------------------------------------------------------------------------
      try_yaml_stream() {
        this.add(stream_start_event());
        this.tag_map = {};
        this.document_start = document_start_event();
        return delete this.document_end;
      }

      got_yaml_stream() {
        this.check_document_end();
        return this.add(stream_end_event());
      }

      got_yaml_version_number(o) {
        if (this.document_start.version != null) {
          die("Multiple %YAML directives not allowed");
        }
        return this.document_start.version = o.text;
      }

      got_tag_handle(o) {
        return this.tag_handle = o.text;
      }

      got_tag_prefix(o) {
        return this.tag_map[this.tag_handle] = o.text;
      }

      got_document_start_indicator() {
        this.check_document_end();
        return this.document_start.explicit = true;
      }

      got_document_end_indicator() {
        if (this.document_end != null) {
          this.document_end.explicit = true;
        }
        return this.check_document_end();
      }

      got_flow_mapping_start() {
        return this.add(mapping_start_event(true));
      }

      got_flow_mapping_end() {
        return this.add(mapping_end_event());
      }

      got_flow_sequence_start() {
        return this.add(sequence_start_event(true));
      }

      got_flow_sequence_end() {
        return this.add(sequence_end_event());
      }

      try_block_mapping() {
        return this.cache_up(mapping_start_event());
      }

      got_block_mapping() {
        return this.cache_down(mapping_end_event());
      }

      not_block_mapping() {
        return this.cache_drop();
      }

      try_block_sequence_context() {
        return this.cache_up(sequence_start_event());
      }

      got_block_sequence_context() {
        return this.cache_down(sequence_end_event());
      }

      not_block_sequence_context() {
        var event;
        event = this.cache_drop()[0];
        this.anchor = event.anchor;
        return this.tag = event.tag;
      }

      try_compact_mapping() {
        return this.cache_up(mapping_start_event());
      }

      got_compact_mapping() {
        return this.cache_down(mapping_end_event());
      }

      not_compact_mapping() {
        return this.cache_drop();
      }

      try_compact_sequence() {
        return this.cache_up(sequence_start_event());
      }

      got_compact_sequence() {
        return this.cache_down(sequence_end_event());
      }

      not_compact_sequence() {
        return this.cache_drop();
      }

      try_flow_pair() {
        return this.cache_up(mapping_start_event(true));
      }

      got_flow_pair() {
        return this.cache_down(mapping_end_event());
      }

      not_flow_pair() {
        return this.cache_drop();
      }

      try_block_mapping_implicit_entry() {
        return this.cache_up();
      }

      got_block_mapping_implicit_entry() {
        return this.cache_down();
      }

      not_block_mapping_implicit_entry() {
        return this.cache_drop();
      }

      try_block_mapping_explicit_entry() {
        return this.cache_up();
      }

      got_block_mapping_explicit_entry() {
        return this.cache_down();
      }

      not_block_mapping_explicit_entry() {
        return this.cache_drop();
      }

      try_flow_mapping_empty_key_entry() {
        return this.cache_up();
      }

      got_flow_mapping_empty_key_entry() {
        return this.cache_down();
      }

      not_flow_mapping_empty_key_entry() {
        return this.cache_drop();
      }

      got_flow_plain_scalar(o) {
        var text;
        text = o.text.replace(/(?:[\ \t]*\r?\n[\ \t]*)/g, "\n").replace(/(\n)(\n*)/g, function(...m) {
          if (m[2].length) {
            return m[2];
          } else {
            return ' ';
          }
        });
        return this.add(scalar_event('plain', text));
      }

      got_single_quoted_scalar(o) {
        var text;
        text = o.text.slice(1, -1).replace(/(?:[\ \t]*\r?\n[\ \t]*)/g, "\n").replace(/(\n)(\n*)/g, function(...m) {
          if (m[2].length) {
            return m[2];
          } else {
            return ' ';
          }
        }).replace(/''/g, "'");
        return this.add(scalar_event('single', text));
      }

      got_double_quoted_scalar(o) {
        return this.add(scalar_event('double', o.text.slice(1, -1).replace(RegExp(`(?:\\r\\n|${end1}|${end2}+|${hex2}|${hex4}|${hex8}|\\\\\\\\|\\\\\\t|\\\\[ bnrt"/])`, "g"), function(m) {
          var n, u;
          if (n = m.match(RegExp(`^${hex2}$`))) {
            return String.fromCharCode(parseInt(n[1], 16));
          }
          if (n = m.match(RegExp(`^${hex4}$`))) {
            return String.fromCharCode(parseInt(n[1], 16));
          }
          if (n = m.match(RegExp(`^${hex8}$`))) {
            return String.fromCharCode(parseInt(n[1], 16));
          }
          if (m.match(RegExp(`^${end1}$`))) {
            return '';
          }
          if (m.match(RegExp(`^${end2}+$`))) {
            u = m.replace(RegExp(`${end2}`), '').replace(RegExp(`${end2}`, "g"), '\n');
            return u || ' ';
          }
          if (u = unescapes[m]) {
            return u;
          }
          return XXX(m);
        })));
      }

      got_empty_line() {
        if (this.in_scalar) {
          return this.add(cache(''));
        }
      }

      got_literal_scalar_line_content(o) {
        return this.add(cache(o.text));
      }

      try_block_literal_scalar() {
        this.in_scalar = true;
        return this.cache_up();
      }

      got_block_literal_scalar() {
        var lines, t, text;
        delete this.in_scalar;
        lines = this.cache_drop();
        if (lines.length > 0 && lines[lines.length - 1].text === '') {
          lines.pop();
        }
        lines = lines.map(function(l) {
          return `${l.text}\n`;
        });
        text = lines.join('');
        t = this.parser.state_curr().t;
        if (t === 'CLIP') {
          text = text.replace(/\n+$/, "\n");
        } else if (t === 'STRIP') {
          text = text.replace(/\n+$/, "");
        } else if (!text.match(/\S/)) {
          text = text.replace(/\n(\n+)$/, "$1");
        }
        return this.add(scalar_event('literal', text));
      }

      not_block_literal_scalar() {
        delete this.in_scalar;
        return this.cache_drop();
      }

      got_folded_scalar_text(o) {
        return this.add(cache(o.text));
      }

      got_folded_scalar_spaced_text(o) {
        return this.add(cache(o.text));
      }

      try_block_folded_scalar() {
        this.in_scalar = true;
        return this.cache_up();
      }

      got_block_folded_scalar() {
        var lines, t, text;
        delete this.in_scalar;
        lines = this.cache_drop().map(function(l) {
          return l.text;
        });
        text = lines.join("\n");
        text = text.replace(/^(\S.*)\n(?=\S)/gm, "$1 ");
        text = text.replace(/^(\S.*)\n(\n+)/gm, "$1$2");
        text = text.replace(/^([\ \t]+\S.*)\n(\n+)(?=\S)/gm, "$1$2");
        text += "\n";
        t = this.parser.state_curr().t;
        if (t === 'CLIP') {
          text = text.replace(/\n+$/, "\n");
          if (text === "\n") {
            text = '';
          }
        } else if (t === 'STRIP') {
          text = text.replace(/\n+$/, "");
        }
        return this.add(scalar_event('folded', text));
      }

      not_block_folded_scalar() {
        delete this.in_scalar;
        return this.cache_drop();
      }

      got_empty_node() {
        return this.add(scalar_event('plain', ''));
      }

      not_block_collection_properties() {
        delete this.tag;
        return delete this.anchor;
      }

      not_block_collection_tag() {
        return delete this.tag;
      }

      not_block_collection_anchor() {
        return delete this.anchor;
      }

      got_anchor_property(o) {
        return this.anchor = o.text.slice(1);
      }

      got_tag_property(o) {
        var m, prefix, tag;
        tag = o.text;
        if (m = tag.match(/^!<(.*)>$/)) {
          this.tag = m[1];
        } else if (m = tag.match(/^!!(.*)/)) {
          prefix = this.tag_map['!!'];
          if (prefix != null) {
            this.tag = prefix + tag.slice(2);
          } else {
            this.tag = `tag:yaml.org,2002:${m[1]}`;
          }
        } else if (m = tag.match(/^(!.*?!)/)) {
          prefix = this.tag_map[m[1]];
          if (prefix != null) {
            this.tag = prefix + tag.slice((m[1].length));
          } else {
            die(`No %TAG entry for '${prefix}'`);
          }
        } else if ((prefix = this.tag_map['!']) != null) {
          this.tag = prefix + tag.slice(1);
        } else {
          this.tag = tag;
        }
        return this.tag = this.tag.replace(/%([0-9a-fA-F]{2})/g, function(...m) {
          return String.fromCharCode(parseInt(m[1], 16));
        });
      }

      got_alias_node(o) {
        return this.add(alias_event(o.text.slice(1)));
      }

    };

    unescapes = {
      '\\\\': '\\',
      '\r\n': '\n',
      '\\ ': ' ',
      '\\"': '"',
      '\\/': '/',
      '\\b': '\b',
      '\\n': '\n',
      '\\r': '\r',
      '\\t': '\t',
      '\\\t': '\t'
    };

    end1 = String(/(?:\\\r?\n[ \t]*)/).slice(1, -1);

    end2 = String(/(?:[ \t]*\r?\n[ \t]*)/).slice(1, -1);

    hex = '[0-9a-fA-F]';

    hex2 = String(RegExp(`(?:\\\\x(${hex}{2}))`)).slice(1, -1);

    hex4 = String(RegExp(`(?:\\\\u(${hex}{4}))`)).slice(1, -1);

    hex8 = String(RegExp(`(?:\\\\U(${hex}{8}))`)).slice(1, -1);

    return Receiver;

  }).call(this);

  // vim: sw=2:

}).call(this);
