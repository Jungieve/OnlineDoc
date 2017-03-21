function handleLogin() {
    var e = [], o = window.swaggerUiAuth.authSchemes || window.swaggerUiAuth.securityDefinitions;
    if (o) {
        var i, n = o;
        for (i in n) {
            var a = n[i];
            if ("oauth2" === a.type && a.scopes) {
                var t;
                if (Array.isArray(a.scopes)) {
                    var p;
                    for (p = 0; p < a.scopes.length; p++)e.push(a.scopes[p])
                } else for (t in a.scopes)e.push({scope: t, description: a.scopes[t], OAuthSchemeKey: i})
            }
        }
    }
    for (window.swaggerUi.api && window.swaggerUi.api.info && (appName = window.swaggerUi.api.info.title), $(".api-popup-dialog").remove(), popupDialog = $(['<div class="api-popup-dialog">', '<div class="api-popup-title">Select OAuth2.0 Scopes</div>', '<div class="api-popup-content">', "<p>Scopes are used to grant an application different levels of access to data on behalf of the end user. Each API may declare one or more scopes.", '<a href="#">Learn how to use</a>', "</p>", "<p><strong>" + appName + "</strong> API requires the following scopes. Select which ones you want to grant to Swagger UI.</p>", '<ul class="api-popup-scopes">', "</ul>", '<p class="error-msg"></p>', '<div class="api-popup-actions"><button class="api-popup-authbtn api-button green" type="button">Authorize</button><button class="api-popup-cancel api-button gray" type="button">Cancel</button></div>', "</div>", "</div>"].join("")), $(document.body).append(popupDialog), popup = popupDialog.find("ul.api-popup-scopes").empty(), p = 0; p < e.length; p++)t = e[p], str = '<li><input type="checkbox" id="scope_' + p + '" scope="' + t.scope + '"" oauthtype="' + t.OAuthSchemeKey + '"/><label for="scope_' + p + '">' + t.scope, t.description && ($.map(o, function (e, o) {
        return o
    }).length > 1 ? str += '<br/><span class="api-scope-desc">' + t.description + " (" + t.OAuthSchemeKey + ")</span>" : str += '<br/><span class="api-scope-desc">' + t.description + "</span>"), str += "</label></li>", popup.append(str);
    var r = $(window), s = r.width(), c = r.height(), l = r.scrollTop(), d = popupDialog.outerWidth(), u = popupDialog.outerHeight(), h = (c - u) / 2 + l, g = (s - d) / 2;
    popupDialog.css({
        top: (h < 0 ? 0 : h) + "px",
        left: (g < 0 ? 0 : g) + "px"
    }), popupDialog.find("button.api-popup-cancel").click(function () {
        popupMask.hide(), popupDialog.hide(), popupDialog.empty(), popupDialog = []
    }), $("button.api-popup-authbtn").unbind(), popupDialog.find("button.api-popup-authbtn").click(function () {
        function e(e) {
            return e.vendorExtensions["x-tokenName"] || e.tokenName
        }

        popupMask.hide(), popupDialog.hide();
        var o, i = window.swaggerUi.api.authSchemes, n = window.location, a = location.pathname.substring(0, location.pathname.lastIndexOf("/")), t = n.protocol + "//" + n.host + a + "/o2c.html", p = window.oAuthRedirectUrl || t, r = null, s = [], c = popup.find("input:checked"), l = [];
        for (k = 0; k < c.length; k++) {
            var d = $(c[k]).attr("scope");
            s.indexOf(d) === -1 && s.push(d);
            var u = $(c[k]).attr("oauthtype");
            l.indexOf(u) === -1 && l.push(u)
        }
        window.enabledScopes = s;
        for (var h in i)if (i.hasOwnProperty(h) && l.indexOf(h) != -1) {
            var g = i[h].flow;
            if ("oauth2" !== i[h].type || !g || "implicit" !== g && "accessCode" !== g) {
                if ("oauth2" === i[h].type && g && "application" === g) {
                    var w = i[h];
                    return window.swaggerUi.tokenName = e(w) || "access_token", void clientCredentialsFlow(s, w.tokenUrl, h)
                }
                if (i[h].grantTypes) {
                    var c = i[h].grantTypes;
                    for (var f in c)if (c.hasOwnProperty(f) && "implicit" === f) {
                        var w = c[f];
                        w.loginEndpoint.url;
                        r = w.loginEndpoint.url + "?response_type=token", window.swaggerUi.tokenName = e(w)
                    } else if (c.hasOwnProperty(f) && "accessCode" === f) {
                        var w = c[f];
                        w.tokenRequestEndpoint.url;
                        r = w.tokenRequestEndpoint.url + "?response_type=code", window.swaggerUi.tokenName = e(w)
                    }
                }
            } else {
                var w = i[h];
                r = w.authorizationUrl + "?response_type=" + ("implicit" === g ? "token" : "code"), window.swaggerUi.tokenName = e(w) || "access_token", window.swaggerUi.tokenUrl = "accessCode" === g ? w.tokenUrl : null, o = h
            }
        }
        redirect_uri = p, r += "&redirect_uri=" + encodeURIComponent(p), r += "&realm=" + encodeURIComponent(realm), r += "&client_id=" + encodeURIComponent(clientId), r += "&scope=" + encodeURIComponent(s.join(scopeSeparator)), r += "&state=" + encodeURIComponent(o);
        for (var h in additionalQueryStringParams)r += "&" + h + "=" + encodeURIComponent(additionalQueryStringParams[h]);
        window.open(r)
    }), popupMask.show(), popupDialog.show()
}
function handleLogout() {
    for (key in window.swaggerUi.api.clientAuthorizations.authz)window.swaggerUi.api.clientAuthorizations.remove(key);
    window.enabledScopes = null, $(".api-ic.ic-on").addClass("ic-off"), $(".api-ic.ic-on").removeClass("ic-on"), $(".api-ic.ic-warning").addClass("ic-error"), $(".api-ic.ic-warning").removeClass("ic-warning")
}
function initOAuth(e) {
    var o = e || {}, i = [];
    return appName = o.appName || i.push("missing appName"), popupMask = o.popupMask || $("#api-common-mask"), popupDialog = o.popupDialog || $(".api-popup-dialog"), clientId = o.clientId || i.push("missing client id"), clientSecret = o.clientSecret || null, realm = o.realm || i.push("missing realm"), scopeSeparator = o.scopeSeparator || " ", additionalQueryStringParams = o.additionalQueryStringParams || {}, i.length > 0 ? void log("auth unable initialize oauth: " + i) : ($("pre code").each(function (e, o) {
        hljs.highlightBlock(o)
    }), $(".api-ic").unbind(), void $(".api-ic").click(function (e) {
        $(e.target).hasClass("ic-off") ? handleLogin() : handleLogout()
    }))
}
function clientCredentialsFlow(e, o, i) {
    var n = {client_id: clientId, client_secret: clientSecret, scope: e.join(" "), grant_type: "client_credentials"};
    $.ajax({
        url: o, type: "POST", data: n, success: function (e, o, n) {
            onOAuthComplete(e, i)
        }, error: function (e, o, i) {
            onOAuthComplete("")
        }
    })
}
var appName, popupMask, popupDialog, clientId, realm, redirect_uri, clientSecret, scopeSeparator, additionalQueryStringParams;
window.processOAuthCode = function (e) {
    var o = e.state, i = window.location, n = location.pathname.substring(0, location.pathname.lastIndexOf("/")), a = i.protocol + "//" + i.host + n + "/o2c.html", t = window.oAuthRedirectUrl || a, p = {
        client_id: clientId,
        code: e.code,
        grant_type: "authorization_code",
        redirect_uri: t
    };
    clientSecret && (p.client_secret = clientSecret), $.ajax({
        url: window.swaggerUiAuth.tokenUrl,
        type: "POST",
        data: p,
        success: function (e, i, n) {
            onOAuthComplete(e, o)
        },
        error: function (e, o, i) {
            onOAuthComplete("")
        }
    })
}, window.onOAuthComplete = function (e, o) {
    if (e)if (e.error) {
        var i = $("input[type=checkbox],.secured");
        i.each(function (e) {
            i[e].checked = !1
        }), alert(e.error)
    } else {
        var n = e[window.swaggerUiAuth.tokenName];
        if (o || (o = e.state), n) {
            var a = null;
            $.each($(".auth .api-ic .api_information_panel"), function (e, o) {
                var i = o;
                if (i && i.childNodes) {
                    var n = [];
                    $.each(i.childNodes, function (e, o) {
                        var i = o.innerHTML;
                        i && n.push(i)
                    });
                    for (var t = [], p = 0; p < n.length; p++) {
                        var r = n[p];
                        window.enabledScopes && window.enabledScopes.indexOf(r) == -1 && t.push(r)
                    }
                    t.length > 0 ? (a = o.parentNode.parentNode, $(a.parentNode).find(".api-ic.ic-on").addClass("ic-off"), $(a.parentNode).find(".api-ic.ic-on").removeClass("ic-on"), $(a).find(".api-ic").addClass("ic-warning"), $(a).find(".api-ic").removeClass("ic-error")) : (a = o.parentNode.parentNode, $(a.parentNode).find(".api-ic.ic-off").addClass("ic-on"), $(a.parentNode).find(".api-ic.ic-off").removeClass("ic-off"), $(a).find(".api-ic").addClass("ic-info"), $(a).find(".api-ic").removeClass("ic-warning"), $(a).find(".api-ic").removeClass("ic-error"))
                }
            }), "undefined" != typeof window.swaggerUi && (window.swaggerUi.api.clientAuthorizations.add(window.swaggerUiAuth.OAuthSchemeKey, new SwaggerClient.ApiKeyAuthorization("Authorization", "Bearer " + n, "header")), window.swaggerUi.load())
        }
    }
};