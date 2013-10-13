
var xmpp = require ('node-xmpp');
var dict = require ('dict');
var _ = require ('underscore');

var WYLIODRIN_NAMESPACE = "wyliodrin";

xmpp.Client.prototype.load = function ()
{
	t = this;

	this.on ('iq', function (stanza)
	{
		var p = stanza.getChild ('ping', 'urn:xmpp:ping');
		if (p && p.type == 'get')
		{
			t.send (new xmpp.Element ('iq', {to:p.attrs.from, id:p.attrs.id}).c('ping', {xmlns:'urn:xmpp:ping'}));
		}
	});

	this.on ('stanza', function (stanza)
	{
		if (stanza.is('message'))
		{
			_.each (stanza.getChildren (null, WYLIODRIN_NAMESPACE), function (es)
			{
				var name = es.getName ();
				var error = stanza.attrs.type !== 'error';
				if (tags().has(name)) tags.get(name)(t, stanza.attrs.from, stanza.attrs.to, es, error);
			});
		}
	});
}

xmpp.Client.prototype.tags = function ()
{
	if (_.isUndefined (this.tags)) this.tags = dict ();
	return this.tags;
}

xmpp.Client.prototype.tag = function (name, namespace, activity)
{
	tags().set (name, activity);
}

exports.xmpp = xmpp;

