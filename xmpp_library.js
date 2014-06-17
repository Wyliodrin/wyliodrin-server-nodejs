"use strict";

var xmpp = require ('node-xmpp-client');
var dict = require ('dict');
var _ = require ('underscore');

var WYLIODRIN_NAMESPACE = "wyliodrin";

var stanzas = [];
var bufferSize = null;

xmpp.Client.prototype.load = function (t, wother,buffer)
{
        // t = this;
        // console.log (this);

        t.other = wother;
        if(!bufferSize)
        {
        	bufferSize = buffer;
        }
        // this.on ('iq', function (stanza)
        // {
        //         var p = stanza.getChild ('ping', 'urn:xmpp:ping');
        //		console.log (stanza.root().toString());
	//         console.log ('stanza');
        //         if (p && p.type == 'get')
        //         {
        //                 console.log ('ping');
        //                 t.send (new xmpp.Element ('iq', {to:p.attrs.from, type:'result', id:p.attrs.id}).c('ping', {xmlns:'urn:xmpp:ping'}));
        //         }
        // });

        this.on ('stanza', function (stanza)
        {
                //console.log ('received = '+stanza.toString());
                if (stanza.is('iq'))
                {
                        var p = stanza.getChild ('ping');
                        // console.log (stanza);
                        if (p && stanza.attrs.type == 'get')
                        {
                                // console.log ('ping');
                                t.send (new xmpp.Element ('iq', {to:p.attrs.from, type:'result', id:p.attrs.id}).c('ping', {xmlns:'urn:xmpp:ping'}));
                        	
			}
                }
                else
                if (stanza.is('message'))
                {
                        _.each (stanza.children, function (es)
                        {
                            //console.log (es.toString());
                                // console.log (es);
                                if (es.getNS() == WYLIODRIN_NAMESPACE)
                                {
                                        var name = es.getName ();
                                        //console.log (name);
                                        var error = stanza.attrs.type == 'error';
                                        try
                                        {
                                            if (t.tags().has(name)) 
                                            {
                                                //console.log ('found tag');
                                                t.tags().get(name)(t, new xmpp.JID(stanza.attrs.from).bare().toString().toLowerCase(), new xmpp.JID(stanza.attrs.to).bare().toString().toLowerCase(), es, error);
                                               // console.log ('sent tag');
                                            }
                                            else 
                                            {
                                               // console.log ('others');
                                                if (t.other) t.other (new xmpp.JID (stanza.attrs.from).bare().toString().toLowerCase(), new xmpp.JID(stanza.attrs.to).bare().toString().toLowerCase(), es, error);
                                               // console.log ('sent to others');
                                            }
                                        }
                                        catch (e)
                                        {
                                            //throw (e);
                                        }
                                }
                        });
                }
                else
                if (stanza.is('presence'))
                {
            
                    var name = stanza.getName ();
                    var error = stanza.attrs.type == 'error';
                    if (t.tags().has(name)) t.tags().get(name)(t, new xmpp.JID(stanza.attrs.from).bare().toString().toLowerCase(), new xmpp.JID(stanza.attrs.to).bare().toString().toLowerCase(), stanza, error);
                    else if (t.other) t.other (new xmpp.JID(stanza.attrs.from).bare().toString().toLowerCase(), new xmpp.JID(stanza.attrs.to).bare().toString().toLowerCase(), stanza, error);
                }
        });
}

xmpp.Client.prototype.tags = function ()
{
        
        if (_.isUndefined (this.tagslist)) this.tagslist = dict ();
        //console.log ('tags list '+this.tagslist.size);
        return this.tagslist;
}

xmpp.Client.prototype.tag = function (name, namespace, activity)
{
        //console.log ('set tag '+name);
        this.tags().set (name, activity);
}

xmpp.Client.prototype.sendWyliodrin = function (to, stanza, store)
{
    stanza.attrs.xmlns = WYLIODRIN_NAMESPACE;
    var s=new xmpp.Element ('message', {to: to}).cnode(stanza);
     //console.log ('sent = '+s.root().toString());
    if(!store)
    {
        // console.log('send');
    	this.send (s);
    }
    else
    {
    	if(stanzas.length<bufferSize)
    	{
    		stanzas.push(s);
    	}
    } 
}

xmpp.Client.prototype.emptyStanzaBuffer = function()
{
        for (var i = 0; i<stanzas.length; i++)
        {
                this.send(stanzas[i]);
        }
}

exports.xmpp = xmpp;
exports.WYLIODRIN_NAMESPACE = WYLIODRIN_NAMESPACE;
