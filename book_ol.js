const fs = require('fs');
const jsdom = require("jsdom");
const url = require('url')

function parse(D) {
  const J = new jsdom.JSDOM(D).window.document;
  const cc = Array.from(J.querySelectorAll("td.cellMediaItemStatus"))
    .map(el => el.textContent.trim())
  const status = toStatus(cc.join("").toLowerCase());
  const elem = J.getElementById("detail-center");
  const content = Array.from(elem.querySelectorAll('.DetailInformationEntryContent'))
    .map(el => el.textContent.trim())
  const name = Array.from(elem.querySelectorAll('.DetailInformationEntryName'))
    .map(el => el.textContent.trim())
  const detail = name.reduce((acc, v, i, a) => {
    if (v.includes("Erschienen")) {
      acc["_release"] = content[i].match(/(20|19|18)\d\d/)[0]
    }
    acc[v.slice(0, -1)] = content[i]
    return acc;
  }, {});
  const avails = toAvails(J.getElementById("copiespanel-wrapper"))
  const now = Date.now();
  return {
    status,
    avails,
    buechereien: Object.keys(avails).sort((a, b) => a === "Zentralbibliothek im PFL" ? -1 : a.localeCompare(b)),
    updated: now,
    added: now,
    id: url.parse(J.head.querySelector("link[rel=canonical]").href, true).query.data,
    isbn: detail["ISBN13"],
    name: detail["Titel"],
    author: detail["Verfasserangabe"],
    release: detail["_release"]
  };
}

function toAvails(elem) {
  return Array.from(elem.querySelectorAll("tr"))
    .slice(1)
    .map(el => Array.from(el.querySelectorAll("td")).map(el => el.textContent.trim()))
    .reduce((acc, v, i, a) => {
      const [nr, buecherei, standort, _, zugang, status] = v
      if (!(buecherei in acc)) acc[buecherei] = [];
      const statusLoc = toStatus(status.toLowerCase());
      let frist = null
      if (statusLoc === "Entliehen") {
        frist = status.match(/bis (\d\d.\d\d.\d{4})/).slice(-1)[0]
      }
      acc[buecherei].push({bereich: null, standort, status: statusLoc, frist, vorbestellungen: 0});
      return acc;
    }, {});
}

function toStatus(c) {
  let status = "Entliehen";
  if (c.includes("verfügbar")) {
    status = "Verfügbar";
  } else if (c.includes("transport")) {
    status = "Transport";
  }
  return status;
}

function update(ref, b) {
  const upd = ["status", "avails", "buechereien", "updated", "id", "isbn", "name", "author", "release"]
  for (const u of upd) {
    ref[u] = b[u];
  }
}

module.exports.parse = parse;
module.exports.update = update;

/*
parse(`
<!DOCTYPE HTML>
<html lang="de-DE" xml:lang="de" xmlns="http://www.w3.org/1999/xhtml">
<head><title>
	Stadtbibliothek Oldenburg - Suchen: Wells, Benedict [Verfasser] - Hard Land
</title><meta http-equiv="content-language" content="de" /><meta name='robots' content='nofollow' /><meta name='description' content='Stadtbibliothek Oldenburg - Mediensuche online' /><meta name="author" content="datronicsoft IT Systems GmbH &amp; Co KG" /><meta name="copyright" content="Copyright datronicsoft IT Systems" /><meta name="publisher" content="datronicsoft IT Systems GmbH &amp; Co KG" /><meta http-equiv="X-UA-Compatible" content="IE=edge" /><meta charset="UTF-8" /><meta http-equiv="content-type" content="text/html; charset=utf-8" /><meta http-equiv="Content-Style-Type" content="text/css" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><link href='https://www.stadtbibliothek.oldenburg.de/webopac/favicon.ico' rel='shortcut icon' /><link href='https://www.stadtbibliothek.oldenburg.de/webopac/favicon.ico' rel='icon' type='image/ico' /><link rel='apple-touch-icon' href='https://www.stadtbibliothek.oldenburg.de/webopac/apple-touch-icon-57x57.png' sizes='57x57' /><link rel='apple-touch-icon' href='https://www.stadtbibliothek.oldenburg.de/webopac/apple-touch-icon-60x60.png' sizes='60x60' /><link rel='apple-touch-icon' href='https://www.stadtbibliothek.oldenburg.de/webopac/apple-touch-icon-72x72.png' sizes='72x72' /><link rel='apple-touch-icon' href='https://www.stadtbibliothek.oldenburg.de/webopac/apple-touch-icon-76x76.png' sizes='76x76' /><link rel='apple-touch-icon' href='https://www.stadtbibliothek.oldenburg.de/webopac/apple-touch-icon-114x114.png' sizes='114x114' /><link rel='apple-touch-icon' href='https://www.stadtbibliothek.oldenburg.de/webopac/apple-touch-icon-120x120.png' sizes='120x120' /><link rel='apple-touch-icon' href='https://www.stadtbibliothek.oldenburg.de/webopac/apple-touch-icon-144x144.png' sizes='144x144' /><link rel='apple-touch-icon' href='https://www.stadtbibliothek.oldenburg.de/webopac/apple-touch-icon-precomposed.png' sizes='152x152' /><link rel='shortcut icon' href='https://www.stadtbibliothek.oldenburg.de/webopac/apple-touch-icon-precomposed.png' sizes='152x152' /><link rel='shortcut icon' href='https://www.stadtbibliothek.oldenburg.de/webopac/apple-touch-icon-precomposed.png' sizes='152x152' /><script src="/webopac/bundles/modernizr?v=inCVuEFe6J4Q07A0AcRsbJic_UE5MwpRMNGcOtk94TE1"></script>

    <!--[if gte IE 7]>
        <style type="text/css">
            .hc-details {
                top: -20px !important;
            }
        </style>
    <![endif]-->
<link rel='canonical' href='https://www.stadtbibliothek.oldenburg.de/oldenburg_wordpress/detail.aspx?referer=MbaT87&data=Y21kPTEmYW1wO3NDPWNfMD0xJSVtXzA9MSUlZl8wPTIlJW9fMD04JSV2XzA9YmVuZWRpY3Qgd2VsbHMlJWdfMD0tMSZhbXA7Q2F0YWxvZ3VlSWQ9OTYzMTYmYW1wO3BhZ2VJZD0yJmFtcDtTcmM9MiZhbXA7cFM9MTAmYW1wO1NvcnQ9WnVnYW5nc2RhdHVtIChCaWJsaW90aGVrKQ=='>
<link rel='alternate' media='only screen and (max-width: 640px)' href='https://www.stadtbibliothek.oldenburg.de/webopac/mobile/detail.aspx?data=Y21kPTEmYW1wO3NDPWNfMD0xJSVtXzA9MSUlZl8wPTIlJW9fMD04JSV2XzA9YmVuZWRpY3Qgd2VsbHMlJWdfMD0tMSZhbXA7Q2F0YWxvZ3VlSWQ9OTYzMTYmYW1wO3BhZ2VJZD0yJmFtcDtTcmM9MiZhbXA7cFM9MTAmYW1wO1NvcnQ9WnVnYW5nc2RhdHVtIChCaWJsaW90aGVrKQ=='></head>
<body id="ctl00_body" class="webopac-b-detail" style="overflow:hidden;">


<div id="DivWarningIE11" class="alert alert-warning" style="display: none;">
    <i class="fa fa-warning fa-lg"></i>
    Sie verwenden den veralteten Web-Browser Internet Explorer 11.0. Dieser kann diese Webseite nicht mehr vollständig darstellen. Bitte wechseln Sie auf einen neueren und sichereren Web-Browser!
</div>
<form method="post" action="./detail.aspx?referer=MbaT87&amp;data=Y21kPTEmYW1wO3NDPWNfMD0xJSVtXzA9MSUlZl8wPTIlJW9fMD04JSV2XzA9YmVuZWRpY3Qgd2VsbHMlJWdfMD0tMSZhbXA7Q2F0YWxvZ3VlSWQ9OTYzMTYmYW1wO3BhZ2VJZD0yJmFtcDtTcmM9MiZhbXA7cFM9MTAmYW1wO1NvcnQ9WnVnYW5nc2RhdHVtIChCaWJsaW90aGVrKQ%3d%3d" id="aspnetForm">
<div class="aspNetHidden">
<input type="hidden" name="__VIEWSTATE" id="__VIEWSTATE" value="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" />
</div>

<div class="aspNetHidden">

	<input type="hidden" name="__VIEWSTATEGENERATOR" id="__VIEWSTATEGENERATOR" value="CDC587C2" />
</div>
    <script src="/webopac/bundles/jQuery?v=N2YlHnRI7it2_JoqUZTYWxPtx-s61zIGkk78Q0eabPM1"></script>
<script src="/webopac/bundles/jQueryUI?v=Do8JAHCRHpVnRQMJ65pn-J2N-ZhuZqRy-Qg3Z-Qlpxk1"></script>
<script src="/webopac/bundles/jQueryAddons?v=lewHxyQz2MDyLYB6mKhLL8Sw5ySWjADbWtIOFNbwzyw1"></script>

    <link href="/webopac/Content/css?v=kFoVJpUdwQWDifR2O7ZvJB4WkiYLkwf-0fPWMvcDiWk1" rel="stylesheet"/>

    <script src='https://www.stadtbibliothek.oldenburg.de/webopac/js/scripts.js' type='text/javascript' charset='UTF-8'></script>

        <style>
            .wp-overlay { display: block !important; position: fixed; z-index: 9999;  text-align: center; width: 100%; margin: auto; top: 0; bottom: 0; height: 100%; background: #fff; }
            .wp-overlay > div { align-content: center; position: absolute; margin: auto; top: 0; bottom: 0; height: 20px; width: 100%; z-index: 9999; font-size: 24px;} 
        </style>
    <link href='https://www.stadtbibliothek.oldenburg.de/wp-content/themes/webopac/css/print.min.css' type='text/css' rel='stylesheet' />
<link href='https://www.stadtbibliothek.oldenburg.de/wp-content/themes/webopac/css/webopac473.css' type='text/css' rel='stylesheet' />
<script src='https://www.stadtbibliothek.oldenburg.de/wp-content/themes/webopac/js/iframeResizer.contentWindow.min.js' type='text/javascript'></script>
<script src='https://www.stadtbibliothek.oldenburg.de/wp-content/themes/webopac/js/webopac.js' type='text/javascript'></script>
<link href='https://www.stadtbibliothek.oldenburg.de/wp-content/themes/webopac/css/zoom.css' type='text/css' rel='stylesheet' />
<link href='https://www.stadtbibliothek.oldenburg.de/wp-content/themes/webopac/css/jquery.flipster.min.css' type='text/css' rel='stylesheet' />


        <a id="top" name="top" style="position: absolute; top: -20px; left: -20px;"></a>
        
        <main>
        <div id="PageMain" class="PageMain container">
            <div id="PageMainContent" class="PageMainContent">
                <div style="left: 0; width: 96px; position: absolute; top: 0; height: 19px" id="DivScrollTop">
                    
                </div>
                <div id="header" class="hidden-print">
                    
                    

<div id="LogoCustomer">
    <a href="https://www.stadtbibliothek.oldenburg.de/webopac/index.aspx">
        <img alt="Stadtbibliothek Oldenburg" src="https://www.stadtbibliothek.oldenburg.de/webopac/customers/oldenburg_wordpress/images/customer.png"/></a>
</div>

                </div>
                

<div id="menu-wrapper" class="hidden-print">
    
    <div id="menu-toolbar">
    <ul id="mainmenu" class="">
        
                
<li id='page-2' class='MenuItem active  '>
<span id='2' class='activemenu'>
<a id="ctl00_mainMenuNavigation_repeaterMainMenu_ctl00_menuItem_HyperLinkMenuItem" class="MenuItemLink" href="https://www.stadtbibliothek.oldenburg.de/webopac/search.aspx">Suchen</a>
</span>


<ul id="ctl00_mainMenuNavigation_repeaterMainMenu_ctl00_menuItem_ulSubMenu" style="margin: 0; display: none;">

</ul>
</li>
                
            
                
<li id='page-3' class='MenuItem  '>
<span id='3' class=''>
<a id="ctl00_mainMenuNavigation_repeaterMainMenu_ctl01_menuItem_HyperLinkMenuItem" class="MenuItemLink" href="https://www.stadtbibliothek.oldenburg.de/webopac/acquisitions.aspx">Neuerwerbungen</a>
</span>


<ul id="ctl00_mainMenuNavigation_repeaterMainMenu_ctl01_menuItem_ulSubMenu" style="margin: 0; display: none;">

</ul>
</li>
                
            
                
<li id='page-4' class='MenuItem  '>
<span id='4' class=''>
<a id="ctl00_mainMenuNavigation_repeaterMainMenu_ctl02_menuItem_HyperLinkMenuItem" class="MenuItemLink" href="https://www.stadtbibliothek.oldenburg.de/webopac/toplist.aspx">Topliste</a>
</span>


<ul id="ctl00_mainMenuNavigation_repeaterMainMenu_ctl02_menuItem_ulSubMenu" style="margin: 0; display: none;">

</ul>
</li>
                
            
                
<li id='page-5' class='MenuItem  '>
<span id='5' class=''>
<a id="ctl00_mainMenuNavigation_repeaterMainMenu_ctl03_menuItem_HyperLinkMenuItem" class="MenuItemLink" href="https://www.stadtbibliothek.oldenburg.de/webopac/antolin.aspx">Antolin</a>
</span>


<ul id="ctl00_mainMenuNavigation_repeaterMainMenu_ctl03_menuItem_ulSubMenu" style="margin: 0; display: none;">

</ul>
</li>
                
            
                
<li id='page-6' class='MenuItem  '>
<span id='6' class=''>
<a id="ctl00_mainMenuNavigation_repeaterMainMenu_ctl04_menuItem_HyperLinkMenuItem" class="MenuItemLink" href="https://www.stadtbibliothek.oldenburg.de/webopac/register.aspx">Register</a>
</span>


<ul id="ctl00_mainMenuNavigation_repeaterMainMenu_ctl04_menuItem_ulSubMenu" style="margin: 0; display: none;">

</ul>
</li>
                
            
                
                

<li id='page-12' class='MenuItem menu-account '>
    <span id='12' class='dropdown '>
    
            <a id="ctl00_mainMenuNavigation_repeaterMainMenu_ctl05_menuItemAccount_HyperLinkMenuItemLogin" class="MenuItemLink loginLink" href="https://www.stadtbibliothek.oldenburg.de/webopac/user/login.aspx">Leserkonto<i class='fa fa-caret-down fa-fix-space-left fa-lg'></i></a>
            <ul id="menuUserAccount" class="dropdown-menu keep-open">
                <li>
                    <div class="loginForm">
                        <div class="loginFormWrapper">
                            <p class="lead text-center" style="margin-bottom: 0">Im Konto anmelden.</p>
                            <hr />
                            <div class="loginBody">
                                <fieldset class="loginFieldset">
                                    <div class="text-center">
                                        <label for="AccountUsername" class="text-left">Nummer des Bibliotheksausweises:</label>
                                        <input type="text" id="AccountUsername" />
                                    </div>
                                    <div class="text-center">
                                        <label for="AccountPassword" class="text-left">Passwort:</label>
                                        <input type="password" id="AccountPassword" autocomplete="off" />
                                    </div>
                                    <div id="divCapsLockWarning" class="text-center">Achtung! Die Feststelltaste ist aktiv!</div>
                                    <div class="text-center">
                                        <br />
                                        <input autofocus id="AccountLoginButton" class="btn btn-primary" type="button" value="Anmelden" style="width: 220px;" />
                                        <br />
                                        <br />
                                        <span>
                                            <a id="ctl00_mainMenuNavigation_repeaterMainMenu_ctl05_menuItemAccount_hyperlinkRegister" href="https://www.stadtbibliothek.oldenburg.de/webopac/user/ReaderRegistration.aspx">Bibliotheksausweis beantragen</a>
                                            <br />
                                            
                                            <br />
                                            <a id="ctl00_mainMenuNavigation_repeaterMainMenu_ctl05_menuItemAccount_hyperlinkPasswordReset" href="https://www.stadtbibliothek.oldenburg.de/webopac/user/PasswordReset.aspx">Passwort zurücksetzen</a>
                                        </span>
                                    </div>
                                </fieldset>
                                <div id="AccountErrorMessage" class="alert alert-error" style="display: none">
                                </div>
                                <div class="loginLoading" style="display: none"><div class="spinner-container"></div>Anmeldung wird überprüft...</div></div>
                        </div>
                    </div>
                </li>
            </ul>
            <script type="text/javascript">
                // close if clicked outside
                $(document).on('click', function (event) {
                    if (!$(event.target).closest('.dropdown, .loginForm').length) {
                        // Hide the menus.
                        $('#ctl00_mainMenuNavigation_repeaterMainMenu_ctl05_menuItemAccount_HyperLinkMenuItemLogin').parents('.dropdown').removeClass('open');
                    }
                });

                // toggle open/close if clicked directly
                $(document).on('click', '#ctl00_mainMenuNavigation_repeaterMainMenu_ctl05_menuItemAccount_HyperLinkMenuItemLogin', function (e) {
                    e.preventDefault();
                    setTimeout(function () {
                        $('#AccountUsername').focus();
                    }, 100);
                    $(this).parents('.dropdown').toggleClass('open');
                    // this return prevents bubbling the event and therefore that the link is followed
                    return false;
                });

                $(document).ready(function () {
                    $('#AccountLoginButton').loginAsync({
                        serviceUserUrl: 'https://www.stadtbibliothek.oldenburg.de/webopac/service/UserService.ashx',
                        usernameField: '#AccountUsername',
                        passwordField: '#AccountPassword',
                        errorObject: '#AccountErrorMessage',
                        loginFormId: '#menuUserAccount',
                        redirectTo: 'https://www.stadtbibliothek.oldenburg.de/webopac/user/overview.aspx',
                        redirectBadPasswordTo: 'https://www.stadtbibliothek.oldenburg.de/webopac/user/settings.aspx?data=dmlldz1wYXNzd29yZA%3d%3d'
                    });

                    $('#divCapsLockWarning').hide();

                    document.getElementById('AccountPassword').addEventListener('keyup', function(event) {
                        if (event.getModifierState && event.getModifierState('CapsLock')) {
                            $('#divCapsLockWarning').show();
                        } else {
                            $('#divCapsLockWarning').hide();
                        }
                    });
                });
            </script>
        
    </span>
    
</li>

            
        
        </ul>
    </div>
    
        <div id="SubMenu" class="submenu ">
            <ul id="ctl00_mainMenuNavigation_MainSubMenu" class="submenu-toolbar ">
                
                        
<li id='page-13' class='MenuItem  '>
<span id='13' class=''>
<a id="ctl00_mainMenuNavigation_repeaterSubMenu_ctl00_menuItem_HyperLinkMenuItem" class="MenuItemLink" href="https://www.stadtbibliothek.oldenburg.de/webopac/search.aspx?data=cGFnZUlkPTEzJmFtcDtjbWQ9NSZhbXA7c0M9Y18wPTElJW1fMD0xJSVmXzA9MjQlJW9fMD04JSV2XzA9QmVzdHNlbGxlciArK2NfMT0zJSVtXzE9MSUlZl8xPTQyJSVvXzE9MSUldl8xPTE4fDIxfDIwfDE2KytjXzI9MyUlbV8yPTElJWZfMj00NSUlb18yPTElJXZfMj01fDExMXwxMDR8NHwxMDF8MTAzfDEwN3wxMDl8MTEwfDEwNnwxMDJ8MTA4JmFtcDtzY3Y9MA%3d%3d">Unsere Bestseller</a>
</span>
<span class='submenuseperator' style='display:none'>|</span>

<ul id="ctl00_mainMenuNavigation_repeaterSubMenu_ctl00_menuItem_ulSubMenu" style="margin: 0; display: none;">

</ul>
</li>
                    
                </ul>
        </div>
    
    
</div>
                
                <!--[if IE 8]>
            <div class="alert alert-danger">Für die korrekte Anzeige dieser Webseite wird ein aktueller Internet-Browser benötigt.
            Bitte aktualisieren Sie Ihren Internet Explorer auf die aktuelle Version.
            </div>
            <![endif]-->
                <div id="ContentMain">
                    
                    <div style="clear: both">
                        
                        
                    </div>
                    <div id="Content">
                        
                        
    
            <div id="DivDetail">
                <div id="detail-right-spaceholder">
                    <div id="detail-right-affix"
                        class="affix-top">
                        <div id="detail-right">
                            <div id="detail-right-wrapper">
                                <div id="webopac">
                                    
                                    <div id="ctl00_ContentPlaceHolderMain_print" class="detail_print detail-icon">
                                        <a href="javascript:window.print();" title="Diese Seite drucken">
                                            <i class="fa fa-print" style="margin-right: 0; font-size: 14px"></i>
                                        </a>
                                    </div>
                                    <div id="ctl00_ContentPlaceHolderMain_permalink" class="detail-icon">
                                        <a id="ctl00_ContentPlaceHolderMain_ImagePermalink" title="Teilen" href="javascript:void(0);">
                                            <i class="fa fa-share-alt"></i>
                                        </a>
                                        <div id="PermaPanel" style="display: none;">
                                            <div id="PermaPanelWrapper">
                                                <div id="SocialWrapper" class="PermaPanelRuler">
                                                    
        <a id="ctl00_ContentPlaceHolderMain_SocialBookmarks_RepeaterBookmarks_ctl00_HyperLinkSocial" title="Bei Facebook hinzufügen" class="socialItem" href="http://www.facebook.com/share.php?u=https://www.stadtbibliothek.oldenburg.de/detail.aspx?Id=96316&amp;t=" target="_blank"><img title="Bei Facebook hinzufügen" src="images/extern/facebook.png" alt="Bei Facebook hinzufügen" /></a>
    
        <a id="ctl00_ContentPlaceHolderMain_SocialBookmarks_RepeaterBookmarks_ctl01_HyperLinkSocial" title="Bei X hinzufügen" class="socialItem" href="http://twitter.com/home?status=https://www.stadtbibliothek.oldenburg.de/detail.aspx?Id=96316" target="_blank"><img title="Bei X hinzufügen" src="images/extern/twitter.png" alt="Bei X hinzufügen" /></a>
    

                                                    <div onclick="copyLinkToClipboard();" type="button" style="display: inline; padding: 1px; margin: 3px 8px 3px;"><i class="fa fa-clipboard fa-lg" title="Link in die Zwischenablage kopieren"></i></div>
                                                </div>
                                                <div id="PermalinkWrapper"><textarea name="ctl00$ContentPlaceHolderMain$permalinkurltext" id="ctl00_ContentPlaceHolderMain_permalinkurltext" style="width: 100%;">https://www.stadtbibliothek.oldenburg.de/detail.aspx?Id=96316</textarea>
                                                    <script type="text/javascript">
                                                        function copyLinkToClipboard() {
                                                            var copyText = document.getElementById('ctl00_ContentPlaceHolderMain_permalinkurltext');
                                                            copyText.focus();
                                                            copyText.select();
                                                            copyText.setSelectionRange(0, 99999);
                                                            document.execCommand("copy");
                                                        }
                                                    </script>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div id="ctl00_ContentPlaceHolderMain_empfehlung" class="detail-icon">
                                        <a id="ctl00_ContentPlaceHolderMain_HyperLinkRecommentImage" title="Dieses Medium empfehlen" href="mailto:%20?subject=Empfehlung&amp;body=Hallo ...,%0Adieses Medium könnte dich interessieren.%0AWells, Benedict [Verfasser] - Hard Land%0Ahttps://www.stadtbibliothek.oldenburg.de/detail.aspx?Id=96316" target="_blank">
                                            <i class="fa fa-envelope"></i>
                                        </a>
                                    </div>
                                </div>
                                <hr class="divider" />
                                <div id="externalsites">
                                    
                                </div>
                                <hr class="divider" />
                                <div id="links">
                                    
                                    
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="DetailWrapper" class="row-fluid">
                    <div id="detail-left-spaceholder" class="span2">
                        <div id="detail-left-affix" class="affix-top">
                            <div id="nav-left" style="white-space: nowrap">
                                <a id="ctl00_ContentPlaceHolderMain_HyperLinkGoBack" href="https://www.stadtbibliothek.oldenburg.de/webopac/search.aspx?data=U29ydD1adWdhbmdzZGF0dW0gKEJpYmxpb3RoZWspJmFtcDtjbWQ9MSZhbXA7cFM9MTAmYW1wO0NhdGFsb2d1ZUlkPTk2MzE2JmFtcDtzQz1jXzA9MSUlbV8wPTElJWZfMD0yJSVvXzA9OCUldl8wPWJlbmVkaWN0IHdlbGxzJSVnXzA9LTEmYW1wO3BhZ2VJZD0yJmFtcDtTcmM9NSZhbXA7c0NhdElkPTk2MzE2JmFtcDtwST0w"><i class='fa fa-angle-double-left fa-space'></i>Trefferliste</a>
                            </div>
                            <div id="detail-left">
                                <div id="detail-left-wrapper">
                                    
                                    <p class="text-center">
                                        <span id="ctl00_ContentPlaceHolderMain_LabelMediengruppe" style="font-weight:bold;">Roman</span>
                                    </p>
                                    <span class="z3988" title="ctx_ver=z39.88-2004&amp;rft_val_fmt=info%3aofi%2ffmt%3akev%3amtx%3abook&amp;rft_id=96316&amp;rft.btitle=Hard+Land&amp;rft.au=Wells,+Benedict+[Verfasser]&amp;rft.isbn=9783257071481"></span> 
                                    <div style="text-align: center; margin: 0 auto; width: auto;">
                                        
<div class="divDetailCoverImage">
<a href="invalidurl" class="glightbox" data-glightbox="type: image; effect: fade; width: 900px; height: auto; zoomable: true; draggable: true;">
<img src="images/mediagrp/leer.png" id="ctl00_ContentPlaceHolderMain_CoverImageDetailControl_NoLinkImageCover" data-fallback-src="https://www.stadtbibliothek.oldenburg.de/webopac/images/mediagrp/leer.png" data-source="buchhandel" class="thumbCoverImage" data-mediagroup-src="https://www.stadtbibliothek.oldenburg.de/webopac/customers/oldenburg_wordpress/images/mediagrp/leer.png" style="max-width:100px;" data-detail="true" data-src="https://cover.winbiap.net/coverservices/getcover.ashx?x13=9783257071481&amp;catid=96316&amp;libid=OLD2&amp;country=DE" alt="Cover" />
</a>
</div>
<div id="ImageSourcePressePlusWrapper" class="margintop10" style="display: none;">
    <a id="ImageSourcePressePlusUrl" href="https://www.presseplus.de" target="_blank" style="font-size: 9pt;">presseplus.de</a>
</div>
<div id="ImageSourceBuchhandelWrapper" class="margintop10" style="display: none;">
    <a id="ImageSourceBuchhandelUrl" href="https://www.buchhandel.de/buch/9783257071481" target="_blank" style="font-size: 9pt;">buchhandel.de</a>
</div>
<div id="ImageSourceHugendubelWrapper" class="margintop10" style="display: none;">
    <a id="ImageSourceHugendubelUrl" href="https://www.hugendubel.info/detail/ISBN-9783257071481?AffiliateID=datronic" target="_blank" style="font-size: 9pt;">hugendubel.info</a>
</div>


                                    </div>
                                    <div id="ctl00_ContentPlaceHolderMain_statusMenu">
                                        <dl>
                                            <dt>Status</dt>
                                            <dd id="dd-status" class="mediaStatus">
                                                <span id="ctl00_ContentPlaceHolderMain_LabelStatus" class="StatusAvailable">verfügbar</span>
                                            </dd>
                                        </dl>
                                    </div>
                                    
                                    <div id="borrowRange" style="display: none">
                                        <dl>
                                            <dt>Ausleihzeit</dt>
                                            <dd id="dd-BorrowRange"></dd>
                                        </dl>
                                    </div>
                                    
                                    <hr id="ctl00_ContentPlaceHolderMain_leftSeparator"></hr>
                                    <div id="ctl00_ContentPlaceHolderMain_branchMenu">
                                        <dl>
                                            <dt>
                                                <span id="ctl00_ContentPlaceHolderMain_LabelBranchName">Zweigstelle</span>
                                            </dt>
                                            <dd>
                                                <span id="ctl00_ContentPlaceHolderMain_LabelBranchContent">Zentralbibliothek im PFL</span>
                                            </dd>
                                        </dl>
                                    </div>
                                    
                                    
                                    

                                    
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="detail-center-container" class="span10">
                        <div id="detail-top-row" class="row-fluid">
                            <div class="span6">
                                
                            </div>
                            <div class="offset2 span4">
                                <div id="nav-detail">
                                    
<div id="detail-navigation" class="pagination pagination-mini">
    <ul>
        <li>
            <a id="ctl00_ContentPlaceHolderMain_CtrlNavigation_NavigateFirst" href="https://www.stadtbibliothek.oldenburg.de/webopac/detail.aspx?data=U29ydD1adWdhbmdzZGF0dW0gKEJpYmxpb3RoZWspJmFtcDtjbWQ9MSZhbXA7cFM9MTAmYW1wO0NhdGFsb2d1ZUlkPTY1MDU2JmFtcDtzQz1jXzA9MSUlbV8wPTElJWZfMD0yJSVvXzA9OCUldl8wPWJlbmVkaWN0IHdlbGxzJSVnXzA9LTEmYW1wO3BhZ2VJZD0yJmFtcDtTcmM9Mg%3d%3d">
        <i class="fa fa-step-backward fa-nav-fixed"></i>
            </a>
        </li>
        <li>
            <a id="ctl00_ContentPlaceHolderMain_CtrlNavigation_NavigatePrevious" href="https://www.stadtbibliothek.oldenburg.de/webopac/detail.aspx?data=U29ydD1adWdhbmdzZGF0dW0gKEJpYmxpb3RoZWspJmFtcDtjbWQ9MSZhbXA7cFM9MTAmYW1wO0NhdGFsb2d1ZUlkPTgyNzE4JmFtcDtzQz1jXzA9MSUlbV8wPTElJWZfMD0yJSVvXzA9OCUldl8wPWJlbmVkaWN0IHdlbGxzJSVnXzA9LTEmYW1wO3BhZ2VJZD0yJmFtcDtTcmM9Mg%3d%3d">
        <i class="fa fa-caret-left fa-nav-fixed nav-prev"></i>
            </a>
        </li>
        <li ><span>
            4 von 15
            </span>
        </li>
        <li>
            <a id="ctl00_ContentPlaceHolderMain_CtrlNavigation_NavigateNext" href="https://www.stadtbibliothek.oldenburg.de/webopac/detail.aspx?data=U29ydD1adWdhbmdzZGF0dW0gKEJpYmxpb3RoZWspJmFtcDtjbWQ9MSZhbXA7cFM9MTAmYW1wO0NhdGFsb2d1ZUlkPTQ5NzYzJmFtcDtzQz1jXzA9MSUlbV8wPTElJWZfMD0yJSVvXzA9OCUldl8wPWJlbmVkaWN0IHdlbGxzJSVnXzA9LTEmYW1wO3BhZ2VJZD0yJmFtcDtTcmM9Mg%3d%3d">
        <i class="fa fa-caret-right fa-nav-fixed nav-next"></i>
            </a>
        </li>
        <li>
            <a id="ctl00_ContentPlaceHolderMain_CtrlNavigation_NavigateLast" href="https://www.stadtbibliothek.oldenburg.de/webopac/detail.aspx?data=U29ydD1adWdhbmdzZGF0dW0gKEJpYmxpb3RoZWspJmFtcDtjbWQ9MSZhbXA7cFM9MTAmYW1wO0NhdGFsb2d1ZUlkPTE1MDEwNSZhbXA7c0M9Y18wPTElJW1fMD0xJSVmXzA9MiUlb18wPTglJXZfMD1iZW5lZGljdCB3ZWxscyUlZ18wPS0xJmFtcDtwYWdlSWQ9MiZhbXA7U3JjPTImYW1wO3BJPTU%3d">
        <i class="fa fa-step-forward fa-nav-fixed"></i>
            </a>
        </li>
    </ul>

</div>

                                </div>
                            </div>
                        </div>
                        
                        <div id="detail-center">
                            <div id="detail-center-wrapper">
                                <table class="DetailInformation" cellspacing="0" id="ctl00_ContentPlaceHolderMain_DataGridInformation" style="border-collapse:collapse;">
	<tr>
		<td class="DetailInformationEntryName" valign="top" style="font-weight:bold;white-space:nowrap;">Person:</td><td class="DetailInformationEntryContent" valign="top"><a title="Alle Medien von dieser Person suchen" class="HypDetail" href="https://www.stadtbibliothek.oldenburg.de/suchen?data=Y21kPTUmYW1wO3NDPWNfMD0xJSVtXzA9MSUlZl8wPTMlJW9fMD04JSV2XzA9V2VsbHMsIEJlbmVkaWN0JSVnXzA9LTE%3d"><em class='matches'>Wells</em>, <em class='matches'>Benedict</em> &#091;Verfasser&#093;</a></td>
	</tr><tr>
		<td class="DetailInformationEntryName" valign="top" style="font-weight:bold;white-space:nowrap;">Titel:</td><td class="DetailInformationEntryContent" valign="top"><a title="Nach Medien mit diesem Titel suchen" class="HypDetail" href="https://www.stadtbibliothek.oldenburg.de/suchen?data=Y21kPTUmYW1wO3NDPWNfMD0xJSVtXzA9MSUlZl8wPTEyJSVvXzA9OCUldl8wPUhhcmQgTGFuZCUlZ18wPS0x">Hard Land</a></td>
	</tr><tr>
		<td class="DetailInformationEntryName" valign="top" style="font-weight:bold;white-space:nowrap;">Einheitssachtitel:</td><td class="DetailInformationEntryContent" valign="top">Hard Land</td>
	</tr><tr>
		<td class="DetailInformationEntryName" valign="top" style="font-weight:bold;white-space:nowrap;">Verfasserangabe:</td><td class="DetailInformationEntryContent" valign="top"><em class='matches'>Benedict</em> <em class='matches'>Wells</em></td>
	</tr><tr>
		<td class="DetailInformationEntryName" valign="top" style="font-weight:bold;white-space:nowrap;">Erschienen:</td><td class="DetailInformationEntryContent" valign="top">Zürich : Diogenes, 2021. - 352 Seiten</td>
	</tr><tr>
		<td class="DetailInformationEntryName" valign="top" style="font-weight:bold;white-space:nowrap;">ISBN13:</td><td class="DetailInformationEntryContent" valign="top">978-3-257-07148-1</td>
	</tr><tr>
		<td class="DetailInformationEntryName" valign="top" style="font-weight:bold;white-space:nowrap;">EAN:</td><td class="DetailInformationEntryContent" valign="top">9783257071481</td>
	</tr><tr>
		<td class="DetailInformationEntryName" valign="top" style="font-weight:bold;white-space:nowrap;">Einband:</td><td class="DetailInformationEntryContent" valign="top">fest gebunden</td>
	</tr><tr>
		<td class="DetailInformationEntryName" valign="top" style="font-weight:bold;white-space:nowrap;">Preis:</td><td class="DetailInformationEntryContent" valign="top">24,00 Euro</td>
	</tr><tr>
		<td class="DetailInformationEntryName" valign="top" style="font-weight:bold;white-space:nowrap;">Interessenkreis:</td><td class="DetailInformationEntryContent" valign="top"><a title="Alle Medien mit diesem Interessenkreis suchen" class="HypDetail" href="https://www.stadtbibliothek.oldenburg.de/suchen?data=Y21kPTUmYW1wO3NDPWNfMD0xJSVtXzA9MSUlZl8wPTI1JSVvXzA9MSUldl8wPVVTQSUlZ18wPS0x">USA</a> ; <a title="Alle Medien mit diesem Interessenkreis suchen" class="HypDetail" href="https://www.stadtbibliothek.oldenburg.de/suchen?data=Y21kPTUmYW1wO3NDPWNfMD0xJSVtXzA9MSUlZl8wPTI1JSVvXzA9MSUldl8wPUtpbmRoZWl0W3NsYXNoXUp1Z2VuZCUlZ18wPS0x">Kindheit/Jugend</a></td>
	</tr><tr>
		<td class="DetailInformationEntryName" valign="top" style="font-weight:bold;white-space:nowrap;">
Schlagwort(e):</td><td class="DetailInformationEntryContent" valign="top"><a title="Alle Medien mit diesem Schlagwort suchen" class="HypDetail" href="https://www.stadtbibliothek.oldenburg.de/suchen?data=Y21kPTUmYW1wO3NDPWNfMD0xJSVtXzA9MSUlZl8wPTI0JSVvXzA9MSUldl8wPUJlbGxldHJpc3Rpc2NoZSBEYXJzdGVsbHVuZyUlZ18wPS0x">Belletristische Darstellung</a> ; <a title="Alle Medien mit diesem Schlagwort suchen" class="HypDetail" href="https://www.stadtbibliothek.oldenburg.de/suchen?data=Y21kPTUmYW1wO3NDPWNfMD0xJSVtXzA9MSUlZl8wPTI0JSVvXzA9MSUldl8wPURKTFAgMjAyMiAoUHJlaXMgZGVyIEp1Z2VuZGp1cnkgLSBOb21pbmllcnVuZyklJWdfMD0tMQ%3d%3d">DJLP 2022 &#040;Preis der Jugendjury - Nominierung&#041;</a></td>
	</tr><tr>
		<td class="DetailInformationEntryName" valign="top" style="font-weight:bold;white-space:nowrap;">Annotation:</td><td class="DetailInformationEntryContent" valign="top">Missouri, 1985: Um vor den Problemen zu Hause zu fliehen, nimmt der 15-jährige Sam einen Ferienjob in einem alten Kino an. Und einen magischen Sommer lang ist alles auf den Kopf gestellt. Er findet Freunde, verliebt sich und entdeckt die Geheimnisse seiner Heimatstadt. Zum ersten Mal ist er kein unscheinbarer Außenseiter mehr. Bis etwas passiert, das ihn zwingt, erwachsen zu werden. Die Geschichte eines Sommers, den man nie mehr vergisst. &#040;Verlagstext&#041;</td>
	</tr><tr>
		<td class="DetailInformationEntryName" valign="top" style="font-weight:bold;white-space:nowrap;">Sprache:</td><td class="DetailInformationEntryContent" valign="top">Deutsch</td>
	</tr>
</table>
                            </div>
                        </div>
                        
                        <div id="ctl00_ContentPlaceHolderMain_CopiesPanel" class="detailCopies" style="text-align: left;">
                            
                            <h3>Exemplare</h3>
                            <div id="copiespanel-wrapper">
                                

<table Id="ctl00_ContentPlaceHolderMain_resultListMediaListViewTable" class="tableCopies">
    
            <thead>
                <tr id="ctl00_ContentPlaceHolderMain_resultListMediaListView_RepeaterMediaCopies_ctl00_headerRow" class="headerCopies">
	<th>Mediennr</th>
	<th id="ctl00_ContentPlaceHolderMain_resultListMediaListView_RepeaterMediaCopies_ctl00_columnBranchHeader">Zweigstelle</th>
	<th>Standort</th>
	<th id="ctl00_ContentPlaceHolderMain_resultListMediaListView_RepeaterMediaCopies_ctl00_columnGuide" style="display:none;"></th>
	<th id="ctl00_ContentPlaceHolderMain_resultListMediaListView_RepeaterMediaCopies_ctl00_columnOrdinalNumber" style="display:none;">Ordnr.</th>
	<th id="ctl00_ContentPlaceHolderMain_resultListMediaListView_RepeaterMediaCopies_ctl00_columnAcquisitionHeader" style="width:80px;display:none;">Zugang</th>
	<th>Status</th>
	<th id="ctl00_ContentPlaceHolderMain_resultListMediaListView_RepeaterMediaCopies_ctl00_columnActionHeader" style="width:120px;display:none;">Aktion</th>
</tr>

            </thead>
        
            <tr id="ctl00_ContentPlaceHolderMain_resultListMediaListView_RepeaterMediaCopies_ctl01_ResultListMediaItemView_resultListMediaItemRow">
	<td class="cellMediaItemBarcode"><span class='mediaBarcode' title='Mediennummer'><i class='fa fa-barcode fa-fw'></i>201507612</span></td>
	<td id="ctl00_ContentPlaceHolderMain_resultListMediaListView_RepeaterMediaCopies_ctl01_ResultListMediaItemView_columnBranchCell" class="cellMediaItemBranch"><span class='mediaBranch' title='Zweigstelle'>Zentralbibliothek im PFL</span></td>
	<td class="cellMediaItemLocation">
        
        <span class='plainregister_1' title='Klarschrift 1: Familie und Liebe'><a href="https://www.stadtbibliothek.oldenburg.de/suchen?data=Y21kPTUmYW1wO3NDPWNfMD0xJSVtXzA9MSUlZl8wPTcyJSVvXzA9MSUldl8wPTFbcGlwZV0xW3BpcGVdRmFtaWxpZSB1bmQgTGllYmUlJWdfMD0tMQ%3d%3d">Familie und Liebe</a></span>&#160;Well
        
    </td>
	<td id="ctl00_ContentPlaceHolderMain_resultListMediaListView_RepeaterMediaCopies_ctl01_ResultListMediaItemView_cellOrdinalNumber" class="cellMediaItemAcquisitions" style="display:none;">
        
    </td>
	<td id="ctl00_ContentPlaceHolderMain_resultListMediaListView_RepeaterMediaCopies_ctl01_ResultListMediaItemView_columnAcquisitionCell" class="cellMediaItemAcquisitions" style="display:none;">
        <span class='accessDate' title='Zugangsdatum'>10.03.2021</span>
    </td>
	<td class="cellMediaItemStatus">
        <span class='mediaStatus StatusAvailable status-1' title='Status: verfügbar'>verfügbar</span>
        <div class="DateofReturn"></div>
        <a id="HyperLinkReservation" title="Sie müssen sich zuerst anmelden, bevor Sie reservieren können" class="reservationWrapper btn-inverse loginButton btn-reservation  btn btn-small btn-reservation noprint btn-block" href="https://www.stadtbibliothek.oldenburg.de/webopac/user/reservate.aspx?data=U29ydD1adWdhbmdzZGF0dW0gKEJpYmxpb3RoZWspJmFtcDtjbWQ9NiZhbXA7cFM9MTAmYW1wO0NhdGFsb2d1ZUlkPTk2MzE2JmFtcDtzQz1jXzA9MSUlbV8wPTElJWZfMD0yJSVvXzA9OCUldl8wPWJlbmVkaWN0IHdlbGxzJSVnXzA9LTEmYW1wO3BhZ2VJZD0yJmFtcDtTcmM9NSZhbXA7c0NhdElkPTk2MzE2JmFtcDtNZWRpYUlkPTExNTk1MSZhbXA7YnJhbmNoaWQ9MSZhbXA7UmVhZGVySWQ9LTEmYW1wO1Jlc2VydmF0aW9uTW9kZT0x" target="_self"><i class='fa fa-level-up fa-rotate-90 fa-fw'></i>&nbsp;Reservieren</a>
        </td>
	<td id="ctl00_ContentPlaceHolderMain_resultListMediaListView_RepeaterMediaCopies_ctl01_ResultListMediaItemView_cellMediaItemReservation" class="cellMediaItemReservation" style="display:none;">
        <a id="HyperLinkReservation" title="Sie müssen sich zuerst anmelden, bevor Sie reservieren können" class="reservationWrapper btn-inverse loginButton btn-reservation  btn btn-small btn-reservation noprint btn-block" href="https://www.stadtbibliothek.oldenburg.de/webopac/user/reservate.aspx?data=U29ydD1adWdhbmdzZGF0dW0gKEJpYmxpb3RoZWspJmFtcDtjbWQ9NiZhbXA7cFM9MTAmYW1wO0NhdGFsb2d1ZUlkPTk2MzE2JmFtcDtzQz1jXzA9MSUlbV8wPTElJWZfMD0yJSVvXzA9OCUldl8wPWJlbmVkaWN0IHdlbGxzJSVnXzA9LTEmYW1wO3BhZ2VJZD0yJmFtcDtTcmM9NSZhbXA7c0NhdElkPTk2MzE2JmFtcDtNZWRpYUlkPTExNTk1MSZhbXA7YnJhbmNoaWQ9MSZhbXA7UmVhZGVySWQ9LTEmYW1wO1Jlc2VydmF0aW9uTW9kZT0x" target="_self"><i class='fa fa-level-up fa-rotate-90 fa-fw'></i>&nbsp;Reservieren</a>
        <span class="DateofReturn"></span>
    </td>
</tr>


        
            <tr id="ctl00_ContentPlaceHolderMain_resultListMediaListView_RepeaterMediaCopies_ctl02_ResultListMediaItemView_resultListMediaItemRow">
	<td class="cellMediaItemBarcode"><span class='mediaBarcode' title='Mediennummer'><i class='fa fa-barcode fa-fw'></i>000674921</span></td>
	<td id="ctl00_ContentPlaceHolderMain_resultListMediaListView_RepeaterMediaCopies_ctl02_ResultListMediaItemView_columnBranchCell" class="cellMediaItemBranch"><span class='mediaBranch' title='Zweigstelle'>Stadtteilbibliothek Flötenteich</span></td>
	<td class="cellMediaItemLocation">
        
        <span class='plainregister_1' title='Klarschrift 1: Familie und Liebe'><a href="https://www.stadtbibliothek.oldenburg.de/suchen?data=Y21kPTUmYW1wO3NDPWNfMD0xJSVtXzA9MSUlZl8wPTcyJSVvXzA9MSUldl8wPTFbcGlwZV0xW3BpcGVdRmFtaWxpZSB1bmQgTGllYmUlJWdfMD0tMQ%3d%3d">Familie und Liebe</a></span>&#160;Well
        
    </td>
	<td id="ctl00_ContentPlaceHolderMain_resultListMediaListView_RepeaterMediaCopies_ctl02_ResultListMediaItemView_cellOrdinalNumber" class="cellMediaItemAcquisitions" style="display:none;">
        
    </td>
	<td id="ctl00_ContentPlaceHolderMain_resultListMediaListView_RepeaterMediaCopies_ctl02_ResultListMediaItemView_columnAcquisitionCell" class="cellMediaItemAcquisitions" style="display:none;">
        <span class='accessDate' title='Zugangsdatum'>30.03.2021</span>
    </td>
	<td class="cellMediaItemStatus">
        <span class='mediaStatus StatusAvailable status-1' title='Status: verfügbar'>verfügbar</span>
        <div class="DateofReturn"></div>
        
        </td>
</tr>


        
            <tr id="ctl00_ContentPlaceHolderMain_resultListMediaListView_RepeaterMediaCopies_ctl03_ResultListMediaItemView_resultListMediaItemRow">
	<td class="cellMediaItemBarcode"><span class='mediaBarcode' title='Mediennummer'><i class='fa fa-barcode fa-fw'></i>000777506</span></td>
	<td id="ctl00_ContentPlaceHolderMain_resultListMediaListView_RepeaterMediaCopies_ctl03_ResultListMediaItemView_columnBranchCell" class="cellMediaItemBranch"><span class='mediaBranch' title='Zweigstelle'>Stadtteilbibliothek Kreyenbrück</span></td>
	<td class="cellMediaItemLocation">
        
        <span class='plainregister_1' title='Klarschrift 1: Familie und Liebe'><a href="https://www.stadtbibliothek.oldenburg.de/suchen?data=Y21kPTUmYW1wO3NDPWNfMD0xJSVtXzA9MSUlZl8wPTcyJSVvXzA9MSUldl8wPTFbcGlwZV0xW3BpcGVdRmFtaWxpZSB1bmQgTGllYmUlJWdfMD0tMQ%3d%3d">Familie und Liebe</a></span>&#160;Well
        
    </td>
	<td id="ctl00_ContentPlaceHolderMain_resultListMediaListView_RepeaterMediaCopies_ctl03_ResultListMediaItemView_cellOrdinalNumber" class="cellMediaItemAcquisitions" style="display:none;">
        
    </td>
	<td id="ctl00_ContentPlaceHolderMain_resultListMediaListView_RepeaterMediaCopies_ctl03_ResultListMediaItemView_columnAcquisitionCell" class="cellMediaItemAcquisitions" style="display:none;">
        <span class='accessDate' title='Zugangsdatum'>30.03.2021</span>
    </td>
	<td class="cellMediaItemStatus">
        <span class='mediaStatus StatusAvailable status-1' title='Status: verfügbar'>verfügbar</span>
        <div class="DateofReturn"></div>
        
        </td>
</tr>


        
            <tr id="ctl00_ContentPlaceHolderMain_resultListMediaListView_RepeaterMediaCopies_ctl04_ResultListMediaItemView_resultListMediaItemRow">
	<td class="cellMediaItemBarcode"><span class='mediaBarcode' title='Mediennummer'><i class='fa fa-barcode fa-fw'></i>000887630</span></td>
	<td id="ctl00_ContentPlaceHolderMain_resultListMediaListView_RepeaterMediaCopies_ctl04_ResultListMediaItemView_columnBranchCell" class="cellMediaItemBranch"><span class='mediaBranch' title='Zweigstelle'>Stadtteilbibliothek Ofenerdiek</span></td>
	<td class="cellMediaItemLocation">
        
        <span class='plainregister_1' title='Klarschrift 1: Familie und Liebe'><a href="https://www.stadtbibliothek.oldenburg.de/suchen?data=Y21kPTUmYW1wO3NDPWNfMD0xJSVtXzA9MSUlZl8wPTcyJSVvXzA9MSUldl8wPTFbcGlwZV0xW3BpcGVdRmFtaWxpZSB1bmQgTGllYmUlJWdfMD0tMQ%3d%3d">Familie und Liebe</a></span>&#160;Well
        
    </td>
	<td id="ctl00_ContentPlaceHolderMain_resultListMediaListView_RepeaterMediaCopies_ctl04_ResultListMediaItemView_cellOrdinalNumber" class="cellMediaItemAcquisitions" style="display:none;">
        
    </td>
	<td id="ctl00_ContentPlaceHolderMain_resultListMediaListView_RepeaterMediaCopies_ctl04_ResultListMediaItemView_columnAcquisitionCell" class="cellMediaItemAcquisitions" style="display:none;">
        <span class='accessDate' title='Zugangsdatum'>21.02.2024</span>
    </td>
	<td class="cellMediaItemStatus">
        <span class='mediaStatus StatusAvailable status-1' title='Status: verfügbar'>verfügbar</span>
        <div class="DateofReturn"></div>
        
        </td>
</tr>


        
            <tr id="ctl00_ContentPlaceHolderMain_resultListMediaListView_RepeaterMediaCopies_ctl05_ResultListMediaItemView_resultListMediaItemRow">
	<td class="cellMediaItemBarcode"><span class='mediaBarcode' title='Mediennummer'><i class='fa fa-barcode fa-fw'></i>000881958</span></td>
	<td id="ctl00_ContentPlaceHolderMain_resultListMediaListView_RepeaterMediaCopies_ctl05_ResultListMediaItemView_columnBranchCell" class="cellMediaItemBranch"><span class='mediaBranch' title='Zweigstelle'>Stadtteilbibliothek Ofenerdiek</span></td>
	<td class="cellMediaItemLocation">
        
        <span class='plainregister_1' title='Klarschrift 1: Familie und Liebe'><a href="https://www.stadtbibliothek.oldenburg.de/suchen?data=Y21kPTUmYW1wO3NDPWNfMD0xJSVtXzA9MSUlZl8wPTcyJSVvXzA9MSUldl8wPTFbcGlwZV0xW3BpcGVdRmFtaWxpZSB1bmQgTGllYmUlJWdfMD0tMQ%3d%3d">Familie und Liebe</a></span>&#160;Well
        
    </td>
	<td id="ctl00_ContentPlaceHolderMain_resultListMediaListView_RepeaterMediaCopies_ctl05_ResultListMediaItemView_cellOrdinalNumber" class="cellMediaItemAcquisitions" style="display:none;">
        
    </td>
	<td id="ctl00_ContentPlaceHolderMain_resultListMediaListView_RepeaterMediaCopies_ctl05_ResultListMediaItemView_columnAcquisitionCell" class="cellMediaItemAcquisitions" style="display:none;">
        <span class='accessDate' title='Zugangsdatum'>30.03.2021</span>
    </td>
	<td class="cellMediaItemStatus">
        <span class='mediaStatus StatusAvailable status-1' title='Status: verfügbar'>verfügbar</span>
        <div class="DateofReturn"></div>
        
        </td>
</tr>


        
            <tr id="ctl00_ContentPlaceHolderMain_resultListMediaListView_RepeaterMediaCopies_ctl06_ResultListMediaItemView_resultListMediaItemRow">
	<td class="cellMediaItemBarcode"><span class='mediaBarcode' title='Mediennummer'><i class='fa fa-barcode fa-fw'></i>201506363</span></td>
	<td id="ctl00_ContentPlaceHolderMain_resultListMediaListView_RepeaterMediaCopies_ctl06_ResultListMediaItemView_columnBranchCell" class="cellMediaItemBranch"><span class='mediaBranch' title='Zweigstelle'>Zentralbibliothek im PFL</span></td>
	<td class="cellMediaItemLocation">
        
        <span class='plainregister_1' title='Klarschrift 1: Familie und Liebe'><a href="https://www.stadtbibliothek.oldenburg.de/suchen?data=Y21kPTUmYW1wO3NDPWNfMD0xJSVtXzA9MSUlZl8wPTcyJSVvXzA9MSUldl8wPTFbcGlwZV0xW3BpcGVdRmFtaWxpZSB1bmQgTGllYmUlJWdfMD0tMQ%3d%3d">Familie und Liebe</a></span>&#160;Well
        
    </td>
	<td id="ctl00_ContentPlaceHolderMain_resultListMediaListView_RepeaterMediaCopies_ctl06_ResultListMediaItemView_cellOrdinalNumber" class="cellMediaItemAcquisitions" style="display:none;">
        
    </td>
	<td id="ctl00_ContentPlaceHolderMain_resultListMediaListView_RepeaterMediaCopies_ctl06_ResultListMediaItemView_columnAcquisitionCell" class="cellMediaItemAcquisitions" style="display:none;">
        <span class='accessDate' title='Zugangsdatum'>18.03.2021</span>
    </td>
	<td class="cellMediaItemStatus">
        <span class='mediaStatus StatusNotAvailable status-2' title='Status: entliehen'>entliehen</span>
        <div class="DateofReturn">(bis 06.01.2026)</div>
        
        </td>
</tr>


        
            <tr id="ctl00_ContentPlaceHolderMain_resultListMediaListView_RepeaterMediaCopies_ctl07_ResultListMediaItemView_resultListMediaItemRow">
	<td class="cellMediaItemBarcode"><span class='mediaBarcode' title='Mediennummer'><i class='fa fa-barcode fa-fw'></i>201507683</span></td>
	<td id="ctl00_ContentPlaceHolderMain_resultListMediaListView_RepeaterMediaCopies_ctl07_ResultListMediaItemView_columnBranchCell" class="cellMediaItemBranch"><span class='mediaBranch' title='Zweigstelle'>Zentralbibliothek im PFL</span></td>
	<td class="cellMediaItemLocation">
        
        <span class='plainregister_1' title='Klarschrift 1: Familie und Liebe'><a href="https://www.stadtbibliothek.oldenburg.de/suchen?data=Y21kPTUmYW1wO3NDPWNfMD0xJSVtXzA9MSUlZl8wPTcyJSVvXzA9MSUldl8wPTFbcGlwZV0xW3BpcGVdRmFtaWxpZSB1bmQgTGllYmUlJWdfMD0tMQ%3d%3d">Familie und Liebe</a></span>&#160;Well
        
    </td>
	<td id="ctl00_ContentPlaceHolderMain_resultListMediaListView_RepeaterMediaCopies_ctl07_ResultListMediaItemView_cellOrdinalNumber" class="cellMediaItemAcquisitions" style="display:none;">
        
    </td>
	<td id="ctl00_ContentPlaceHolderMain_resultListMediaListView_RepeaterMediaCopies_ctl07_ResultListMediaItemView_columnAcquisitionCell" class="cellMediaItemAcquisitions" style="display:none;">
        <span class='accessDate' title='Zugangsdatum'>18.03.2021</span>
    </td>
	<td class="cellMediaItemStatus">
        <span class='mediaStatus StatusNotAvailable status-2' title='Status: entliehen'>entliehen</span>
        <div class="DateofReturn">(bis 05.01.2026)</div>
        
        </td>
</tr>


        
            <tr id="ctl00_ContentPlaceHolderMain_resultListMediaListView_RepeaterMediaCopies_ctl08_ResultListMediaItemView_resultListMediaItemRow">
	<td class="cellMediaItemBarcode"><span class='mediaBarcode' title='Mediennummer'><i class='fa fa-barcode fa-fw'></i>000590443</span></td>
	<td id="ctl00_ContentPlaceHolderMain_resultListMediaListView_RepeaterMediaCopies_ctl08_ResultListMediaItemView_columnBranchCell" class="cellMediaItemBranch"><span class='mediaBranch' title='Zweigstelle'>Stadtteilbibliothek Eversten</span></td>
	<td class="cellMediaItemLocation">
        
        <span class='plainregister_1' title='Klarschrift 1: Familie und Liebe'><a href="https://www.stadtbibliothek.oldenburg.de/suchen?data=Y21kPTUmYW1wO3NDPWNfMD0xJSVtXzA9MSUlZl8wPTcyJSVvXzA9MSUldl8wPTFbcGlwZV0xW3BpcGVdRmFtaWxpZSB1bmQgTGllYmUlJWdfMD0tMQ%3d%3d">Familie und Liebe</a></span>&#160;Well
        
    </td>
	<td id="ctl00_ContentPlaceHolderMain_resultListMediaListView_RepeaterMediaCopies_ctl08_ResultListMediaItemView_cellOrdinalNumber" class="cellMediaItemAcquisitions" style="display:none;">
        
    </td>
	<td id="ctl00_ContentPlaceHolderMain_resultListMediaListView_RepeaterMediaCopies_ctl08_ResultListMediaItemView_columnAcquisitionCell" class="cellMediaItemAcquisitions" style="display:none;">
        <span class='accessDate' title='Zugangsdatum'>30.03.2021</span>
    </td>
	<td class="cellMediaItemStatus">
        <span class='mediaStatus StatusNotAvailable status-2' title='Status: entliehen'>entliehen</span>
        <div class="DateofReturn">(bis 05.01.2026)</div>
        
        </td>
</tr>


        
</table>


                            </div>
                            
                        </div>
                        
                        
                        
                        
                        <div id="ctl00_ContentPlaceHolderMain_panelSeries">
	
                            <div id="series">
                                <div id="seriesModal" class="modal hide fade" tabindex="-1" role="dialog" aria-hidden="true">
                                    <div class="modal-header">
                                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
                                        <h3 id="myModalLabel">Reihe</h3>
                                    </div>
                                    <div class="modal-body">
                                        <p>
                                            <table class="table">
                                                
                                            </table>
                                        </p>
                                    </div>
                                    <div class="modal-footer">
                                        <button class="btn" data-dismiss="modal" aria-hidden="true">Schließen</button>
                                    </div>
                                </div>
                            </div>
                        
</div>
                        
                        <div id="ctl00_ContentPlaceHolderMain_divSuggestions">
                            <h3>Tipps</h3>
                            Andere Lesende fanden diese Medien interessant:
                            <div id="suggestionCoverFlow" class="flow">
                                <ul><li>
                                    <a href='https://www.stadtbibliothek.oldenburg.de/webopac/detail.aspx?data=U29ydD1adWdhbmdzZGF0dW0gKEJpYmxpb3RoZWspJmFtcDtjbWQ9MSZhbXA7cFM9MTAmYW1wO0NhdGFsb2d1ZUlkPTEzNDMxOCZhbXA7c0M9Y18wPTElJW1fMD0xJSVmXzA9MiUlb18wPTglJXZfMD1iZW5lZGljdCB3ZWxscyUlZ18wPS0xJmFtcDtwYWdlSWQ9MiZhbXA7U3JjPTUmYW1wO1NyY0lkPTI%3d' title='Beeren pflücken (Roman - entliehen)'>
                                        <img style='width:120px' data-fallback-src='https://www.stadtbibliothek.oldenburg.de/webopac/images/mediagrp/leer.png' 
                                            data-src='https://cover.winbiap.net/coverservices/getcover.ashx?x13=9783365009444&catid=134318&libid=OLD2&country=DE' 
                                            alt='Beeren pflücken'
                                            class='thumbCoverImageEager'
                                            data-mediagroup-src='https://www.stadtbibliothek.oldenburg.de/webopac/customers/oldenburg_wordpress/images/mediagrp/leer.png' />
                                        <span class='mediaStatus StatusNotAvailable status-2' title='Status: entliehen'>entliehen</span>
                                    </a>
                                </li><li>
                                    <a href='https://www.stadtbibliothek.oldenburg.de/webopac/detail.aspx?data=U29ydD1adWdhbmdzZGF0dW0gKEJpYmxpb3RoZWspJmFtcDtjbWQ9MSZhbXA7cFM9MTAmYW1wO0NhdGFsb2d1ZUlkPTEzNzE3NSZhbXA7c0M9Y18wPTElJW1fMD0xJSVmXzA9MiUlb18wPTglJXZfMD1iZW5lZGljdCB3ZWxscyUlZ18wPS0xJmFtcDtwYWdlSWQ9MiZhbXA7U3JjPTUmYW1wO1NyY0lkPTI%3d' title='Unsere letzten wilden Tage (Roman - entliehen)'>
                                        <img style='width:120px' data-fallback-src='https://www.stadtbibliothek.oldenburg.de/webopac/images/mediagrp/leer.png' 
                                            data-src='https://cover.winbiap.net/coverservices/getcover.ashx?x13=9783352010163&catid=137175&libid=OLD2&country=DE' 
                                            alt='Unsere letzten wilden Tage'
                                            class='thumbCoverImageEager'
                                            data-mediagroup-src='https://www.stadtbibliothek.oldenburg.de/webopac/customers/oldenburg_wordpress/images/mediagrp/leer.png' />
                                        <span class='mediaStatus StatusNotAvailable status-2' title='Status: entliehen'>entliehen</span>
                                    </a>
                                </li><li>
                                    <a href='https://www.stadtbibliothek.oldenburg.de/webopac/detail.aspx?data=U29ydD1adWdhbmdzZGF0dW0gKEJpYmxpb3RoZWspJmFtcDtjbWQ9MSZhbXA7cFM9MTAmYW1wO0NhdGFsb2d1ZUlkPTEzNjM2MiZhbXA7c0M9Y18wPTElJW1fMD0xJSVmXzA9MiUlb18wPTglJXZfMD1iZW5lZGljdCB3ZWxscyUlZ18wPS0xJmFtcDtwYWdlSWQ9MiZhbXA7U3JjPTUmYW1wO1NyY0lkPTI%3d' title='Dr. No (Roman - entliehen)'>
                                        <img style='width:120px' data-fallback-src='https://www.stadtbibliothek.oldenburg.de/webopac/images/mediagrp/leer.png' 
                                            data-src='https://cover.winbiap.net/coverservices/getcover.ashx?x13=9783446284173&catid=136362&libid=OLD2&country=DE' 
                                            alt='Dr. No'
                                            class='thumbCoverImageEager'
                                            data-mediagroup-src='https://www.stadtbibliothek.oldenburg.de/webopac/customers/oldenburg_wordpress/images/mediagrp/leer.png' />
                                        <span class='mediaStatus StatusNotAvailable status-2' title='Status: entliehen'>entliehen</span>
                                    </a>
                                </li><li>
                                    <a href='https://www.stadtbibliothek.oldenburg.de/webopac/detail.aspx?data=U29ydD1adWdhbmdzZGF0dW0gKEJpYmxpb3RoZWspJmFtcDtjbWQ9MSZhbXA7cFM9MTAmYW1wO0NhdGFsb2d1ZUlkPTE1NTY4MSZhbXA7c0M9Y18wPTElJW1fMD0xJSVmXzA9MiUlb18wPTglJXZfMD1iZW5lZGljdCB3ZWxscyUlZ18wPS0xJmFtcDtwYWdlSWQ9MiZhbXA7U3JjPTUmYW1wO1NyY0lkPTI%3d' title='Schattennummer (Roman - vorbestellt)'>
                                        <img style='width:120px' data-fallback-src='https://www.stadtbibliothek.oldenburg.de/webopac/images/mediagrp/leer.png' 
                                            data-src='https://cover.winbiap.net/coverservices/getcover.ashx?x13=9783498008222&catid=155681&libid=OLD2&country=DE' 
                                            alt='Schattennummer'
                                            class='thumbCoverImageEager'
                                            data-mediagroup-src='https://www.stadtbibliothek.oldenburg.de/webopac/customers/oldenburg_wordpress/images/mediagrp/leer.png' />
                                        <span class='mediaStatus StatusReservation status-3' title='Status: vorbestellt'>vorbestellt</span>
                                    </a>
                                </li><li>
                                    <a href='https://www.stadtbibliothek.oldenburg.de/webopac/detail.aspx?data=U29ydD1adWdhbmdzZGF0dW0gKEJpYmxpb3RoZWspJmFtcDtjbWQ9MSZhbXA7cFM9MTAmYW1wO0NhdGFsb2d1ZUlkPTEyMjYxOSZhbXA7c0M9Y18wPTElJW1fMD0xJSVmXzA9MiUlb18wPTglJXZfMD1iZW5lZGljdCB3ZWxscyUlZ18wPS0xJmFtcDtwYWdlSWQ9MiZhbXA7U3JjPTUmYW1wO1NyY0lkPTI%3d' title='Demon Copperhead (Roman - verfügbar)'>
                                        <img style='width:120px' data-fallback-src='https://www.stadtbibliothek.oldenburg.de/webopac/images/mediagrp/leer.png' 
                                            data-src='https://cover.winbiap.net/coverservices/getcover.ashx?x13=9783423283960&catid=122619&libid=OLD2&country=DE' 
                                            alt='Demon Copperhead'
                                            class='thumbCoverImageEager'
                                            data-mediagroup-src='https://www.stadtbibliothek.oldenburg.de/webopac/customers/oldenburg_wordpress/images/mediagrp/leer.png' />
                                        <span class='mediaStatus StatusAvailable status-1' title='Status: verfügbar'>verfügbar</span>
                                    </a>
                                </li><li>
                                    <a href='https://www.stadtbibliothek.oldenburg.de/webopac/detail.aspx?data=U29ydD1adWdhbmdzZGF0dW0gKEJpYmxpb3RoZWspJmFtcDtjbWQ9MSZhbXA7cFM9MTAmYW1wO0NhdGFsb2d1ZUlkPTEyOTQwMiZhbXA7c0M9Y18wPTElJW1fMD0xJSVmXzA9MiUlb18wPTglJXZfMD1iZW5lZGljdCB3ZWxscyUlZ18wPS0xJmFtcDtwYWdlSWQ9MiZhbXA7U3JjPTUmYW1wO1NyY0lkPTI%3d' title='Tausend Meilen weites Land (Roman - verfügbar)'>
                                        <img style='width:120px' data-fallback-src='https://www.stadtbibliothek.oldenburg.de/webopac/images/mediagrp/leer.png' 
                                            data-src='https://cover.winbiap.net/coverservices/getcover.ashx?x13=9783740821272&catid=129402&libid=OLD2&country=DE' 
                                            alt='Tausend Meilen weites Land'
                                            class='thumbCoverImageEager'
                                            data-mediagroup-src='https://www.stadtbibliothek.oldenburg.de/webopac/customers/oldenburg_wordpress/images/mediagrp/leer.png' />
                                        <span class='mediaStatus StatusAvailable status-1' title='Status: verfügbar'>verfügbar</span>
                                    </a>
                                </li><li>
                                    <a href='https://www.stadtbibliothek.oldenburg.de/webopac/detail.aspx?data=U29ydD1adWdhbmdzZGF0dW0gKEJpYmxpb3RoZWspJmFtcDtjbWQ9MSZhbXA7cFM9MTAmYW1wO0NhdGFsb2d1ZUlkPTEyNzQ4MCZhbXA7c0M9Y18wPTElJW1fMD0xJSVmXzA9MiUlb18wPTglJXZfMD1iZW5lZGljdCB3ZWxscyUlZ18wPS0xJmFtcDtwYWdlSWQ9MiZhbXA7U3JjPTUmYW1wO1NyY0lkPTI%3d' title='So gehn wir denn hinab (Roman - verfügbar)'>
                                        <img style='width:120px' data-fallback-src='https://www.stadtbibliothek.oldenburg.de/webopac/images/mediagrp/leer.png' 
                                            data-src='https://cover.winbiap.net/coverservices/getcover.ashx?x13=9783956146008&catid=127480&libid=OLD2&country=DE' 
                                            alt='So gehn wir denn hinab'
                                            class='thumbCoverImageEager'
                                            data-mediagroup-src='https://www.stadtbibliothek.oldenburg.de/webopac/customers/oldenburg_wordpress/images/mediagrp/leer.png' />
                                        <span class='mediaStatus StatusAvailable status-1' title='Status: verfügbar'>verfügbar</span>
                                    </a>
                                </li><li>
                                    <a href='https://www.stadtbibliothek.oldenburg.de/webopac/detail.aspx?data=U29ydD1adWdhbmdzZGF0dW0gKEJpYmxpb3RoZWspJmFtcDtjbWQ9MSZhbXA7cFM9MTAmYW1wO0NhdGFsb2d1ZUlkPTEyNzQ4MSZhbXA7c0M9Y18wPTElJW1fMD0xJSVmXzA9MiUlb18wPTglJXZfMD1iZW5lZGljdCB3ZWxscyUlZ18wPS0xJmFtcDtwYWdlSWQ9MiZhbXA7U3JjPTUmYW1wO1NyY0lkPTI%3d' title='Die Intuitionistin (Roman - verfügbar)'>
                                        <img style='width:120px' data-fallback-src='https://www.stadtbibliothek.oldenburg.de/webopac/images/mediagrp/leer.png' 
                                            data-src='https://cover.winbiap.net/coverservices/getcover.ashx?x13=9783446261839&catid=127481&libid=OLD2&country=DE' 
                                            alt='Die Intuitionistin'
                                            class='thumbCoverImageEager'
                                            data-mediagroup-src='https://www.stadtbibliothek.oldenburg.de/webopac/customers/oldenburg_wordpress/images/mediagrp/leer.png' />
                                        <span class='mediaStatus StatusAvailable status-1' title='Status: verfügbar'>verfügbar</span>
                                    </a>
                                </li><li>
                                    <a href='https://www.stadtbibliothek.oldenburg.de/webopac/detail.aspx?data=U29ydD1adWdhbmdzZGF0dW0gKEJpYmxpb3RoZWspJmFtcDtjbWQ9MSZhbXA7cFM9MTAmYW1wO0NhdGFsb2d1ZUlkPTEyODE3NCZhbXA7c0M9Y18wPTElJW1fMD0xJSVmXzA9MiUlb18wPTglJXZfMD1iZW5lZGljdCB3ZWxscyUlZ18wPS0xJmFtcDtwYWdlSWQ9MiZhbXA7U3JjPTUmYW1wO1NyY0lkPTI%3d' title='Das Schimmern der Träume (Roman - verfügbar)'>
                                        <img style='width:120px' data-fallback-src='https://www.stadtbibliothek.oldenburg.de/webopac/images/mediagrp/leer.png' 
                                            data-src='https://cover.winbiap.net/coverservices/getcover.ashx?x13=9783404193233&catid=128174&libid=OLD2&country=DE' 
                                            alt='Das Schimmern der Träume'
                                            class='thumbCoverImageEager'
                                            data-mediagroup-src='https://www.stadtbibliothek.oldenburg.de/webopac/customers/oldenburg_wordpress/images/mediagrp/leer.png' />
                                        <span class='mediaStatus StatusAvailable status-1' title='Status: verfügbar'>verfügbar</span>
                                    </a>
                                </li><li>
                                    <a href='https://www.stadtbibliothek.oldenburg.de/webopac/detail.aspx?data=U29ydD1adWdhbmdzZGF0dW0gKEJpYmxpb3RoZWspJmFtcDtjbWQ9MSZhbXA7cFM9MTAmYW1wO0NhdGFsb2d1ZUlkPTEzMDYyMSZhbXA7c0M9Y18wPTElJW1fMD0xJSVmXzA9MiUlb18wPTglJXZfMD1iZW5lZGljdCB3ZWxscyUlZ18wPS0xJmFtcDtwYWdlSWQ9MiZhbXA7U3JjPTUmYW1wO1NyY0lkPTI%3d' title='Wie lange, sag mir, ist der Zug schon fort (Roman - verfügbar)'>
                                        <img style='width:120px' data-fallback-src='https://www.stadtbibliothek.oldenburg.de/webopac/images/mediagrp/leer.png' 
                                            data-src='https://cover.winbiap.net/coverservices/getcover.ashx?x13=9783423284028&catid=130621&libid=OLD2&country=DE' 
                                            alt='Wie lange, sag mir, ist der Zug schon fort'
                                            class='thumbCoverImageEager'
                                            data-mediagroup-src='https://www.stadtbibliothek.oldenburg.de/webopac/customers/oldenburg_wordpress/images/mediagrp/leer.png' />
                                        <span class='mediaStatus StatusAvailable status-1' title='Status: verfügbar'>verfügbar</span>
                                    </a>
                                </li><li>
                                    <a href='https://www.stadtbibliothek.oldenburg.de/webopac/detail.aspx?data=U29ydD1adWdhbmdzZGF0dW0gKEJpYmxpb3RoZWspJmFtcDtjbWQ9MSZhbXA7cFM9MTAmYW1wO0NhdGFsb2d1ZUlkPTEyMjYxOSZhbXA7c0M9Y18wPTElJW1fMD0xJSVmXzA9MiUlb18wPTglJXZfMD1iZW5lZGljdCB3ZWxscyUlZ18wPS0xJmFtcDtwYWdlSWQ9MiZhbXA7U3JjPTUmYW1wO1NyY0lkPTI%3d' title='Demon Copperhead (Roman - entliehen)'>
                                        <img style='width:120px' data-fallback-src='https://www.stadtbibliothek.oldenburg.de/webopac/images/mediagrp/leer.png' 
                                            data-src='https://cover.winbiap.net/coverservices/getcover.ashx?x13=9783423283960&catid=122619&libid=OLD2&country=DE' 
                                            alt='Demon Copperhead'
                                            class='thumbCoverImageEager'
                                            data-mediagroup-src='https://www.stadtbibliothek.oldenburg.de/webopac/customers/oldenburg_wordpress/images/mediagrp/leer.png' />
                                        <span class='mediaStatus StatusNotAvailable status-2' title='Status: entliehen'>entliehen</span>
                                    </a>
                                </li><li>
                                    <a href='https://www.stadtbibliothek.oldenburg.de/webopac/detail.aspx?data=U29ydD1adWdhbmdzZGF0dW0gKEJpYmxpb3RoZWspJmFtcDtjbWQ9MSZhbXA7cFM9MTAmYW1wO0NhdGFsb2d1ZUlkPTEyNzQ3MCZhbXA7c0M9Y18wPTElJW1fMD0xJSVmXzA9MiUlb18wPTglJXZfMD1iZW5lZGljdCB3ZWxscyUlZ18wPS0xJmFtcDtwYWdlSWQ9MiZhbXA7U3JjPTUmYW1wO1NyY0lkPTI%3d' title='Wüstenstern (Roman - entliehen)'>
                                        <img style='width:120px' data-fallback-src='https://www.stadtbibliothek.oldenburg.de/webopac/images/mediagrp/leer.png' 
                                            data-src='https://cover.winbiap.net/coverservices/getcover.ashx?x13=9783311125754&catid=127470&libid=OLD2&country=DE' 
                                            alt='Wüstenstern'
                                            class='thumbCoverImageEager'
                                            data-mediagroup-src='https://www.stadtbibliothek.oldenburg.de/webopac/customers/oldenburg_wordpress/images/mediagrp/leer.png' />
                                        <span class='mediaStatus StatusNotAvailable status-2' title='Status: entliehen'>entliehen</span>
                                    </a>
                                </li><li>
                                    <a href='https://www.stadtbibliothek.oldenburg.de/webopac/detail.aspx?data=U29ydD1adWdhbmdzZGF0dW0gKEJpYmxpb3RoZWspJmFtcDtjbWQ9MSZhbXA7cFM9MTAmYW1wO0NhdGFsb2d1ZUlkPTExODY1MCZhbXA7c0M9Y18wPTElJW1fMD0xJSVmXzA9MiUlb18wPTglJXZfMD1iZW5lZGljdCB3ZWxscyUlZ18wPS0xJmFtcDtwYWdlSWQ9MiZhbXA7U3JjPTUmYW1wO1NyY0lkPTI%3d' title='Dunkle Stunden (Roman - verfügbar)'>
                                        <img style='width:120px' data-fallback-src='https://www.stadtbibliothek.oldenburg.de/webopac/images/mediagrp/leer.png' 
                                            data-src='https://cover.winbiap.net/coverservices/getcover.ashx?x13=9783311125709&catid=118650&libid=OLD2&country=DE' 
                                            alt='Dunkle Stunden'
                                            class='thumbCoverImageEager'
                                            data-mediagroup-src='https://www.stadtbibliothek.oldenburg.de/webopac/customers/oldenburg_wordpress/images/mediagrp/leer.png' />
                                        <span class='mediaStatus StatusAvailable status-1' title='Status: verfügbar'>verfügbar</span>
                                    </a>
                                </li><li>
                                    <a href='https://www.stadtbibliothek.oldenburg.de/webopac/detail.aspx?data=U29ydD1adWdhbmdzZGF0dW0gKEJpYmxpb3RoZWspJmFtcDtjbWQ9MSZhbXA7cFM9MTAmYW1wO0NhdGFsb2d1ZUlkPTExNjEyOCZhbXA7c0M9Y18wPTElJW1fMD0xJSVmXzA9MiUlb18wPTglJXZfMD1iZW5lZGljdCB3ZWxscyUlZ18wPS0xJmFtcDtwYWdlSWQ9MiZhbXA7U3JjPTUmYW1wO1NyY0lkPTI%3d' title='Das Band, das uns hält (Roman - verfügbar)'>
                                        <img style='width:120px' data-fallback-src='https://www.stadtbibliothek.oldenburg.de/webopac/images/mediagrp/leer.png' 
                                            data-src='https://cover.winbiap.net/coverservices/getcover.ashx?x13=9783257072297&catid=116128&libid=OLD2&country=DE' 
                                            alt='Das Band, das uns hält'
                                            class='thumbCoverImageEager'
                                            data-mediagroup-src='https://www.stadtbibliothek.oldenburg.de/webopac/customers/oldenburg_wordpress/images/mediagrp/leer.png' />
                                        <span class='mediaStatus StatusAvailable status-1' title='Status: verfügbar'>verfügbar</span>
                                    </a>
                                </li><li>
                                    <a href='https://www.stadtbibliothek.oldenburg.de/webopac/detail.aspx?data=U29ydD1adWdhbmdzZGF0dW0gKEJpYmxpb3RoZWspJmFtcDtjbWQ9MSZhbXA7cFM9MTAmYW1wO0NhdGFsb2d1ZUlkPTExMzI3NiZhbXA7c0M9Y18wPTElJW1fMD0xJSVmXzA9MiUlb18wPTglJXZfMD1iZW5lZGljdCB3ZWxscyUlZ18wPS0xJmFtcDtwYWdlSWQ9MiZhbXA7U3JjPTUmYW1wO1NyY0lkPTI%3d' title='Überfluss (Roman - verfügbar)'>
                                        <img style='width:120px' data-fallback-src='https://www.stadtbibliothek.oldenburg.de/webopac/images/mediagrp/leer.png' 
                                            data-src='https://cover.winbiap.net/coverservices/getcover.ashx?x13=9783906903200&catid=113276&libid=OLD2&country=DE' 
                                            alt='Überfluss'
                                            class='thumbCoverImageEager'
                                            data-mediagroup-src='https://www.stadtbibliothek.oldenburg.de/webopac/customers/oldenburg_wordpress/images/mediagrp/leer.png' />
                                        <span class='mediaStatus StatusAvailable status-1' title='Status: verfügbar'>verfügbar</span>
                                    </a>
                                </li><li>
                                    <a href='https://www.stadtbibliothek.oldenburg.de/webopac/detail.aspx?data=U29ydD1adWdhbmdzZGF0dW0gKEJpYmxpb3RoZWspJmFtcDtjbWQ9MSZhbXA7cFM9MTAmYW1wO0NhdGFsb2d1ZUlkPTExODA1OCZhbXA7c0M9Y18wPTElJW1fMD0xJSVmXzA9MiUlb18wPTglJXZfMD1iZW5lZGljdCB3ZWxscyUlZ18wPS0xJmFtcDtwYWdlSWQ9MiZhbXA7U3JjPTUmYW1wO1NyY0lkPTI%3d' title='Die Regeln des Spiels (Roman - verfügbar)'>
                                        <img style='width:120px' data-fallback-src='https://www.stadtbibliothek.oldenburg.de/webopac/images/mediagrp/leer.png' 
                                            data-src='https://cover.winbiap.net/coverservices/getcover.ashx?x13=9783446277540&catid=118058&libid=OLD2&country=DE' 
                                            alt='Die Regeln des Spiels'
                                            class='thumbCoverImageEager'
                                            data-mediagroup-src='https://www.stadtbibliothek.oldenburg.de/webopac/customers/oldenburg_wordpress/images/mediagrp/leer.png' />
                                        <span class='mediaStatus StatusAvailable status-1' title='Status: verfügbar'>verfügbar</span>
                                    </a>
                                </li><li>
                                    <a href='https://www.stadtbibliothek.oldenburg.de/webopac/detail.aspx?data=U29ydD1adWdhbmdzZGF0dW0gKEJpYmxpb3RoZWspJmFtcDtjbWQ9MSZhbXA7cFM9MTAmYW1wO0NhdGFsb2d1ZUlkPTEyMDg0OCZhbXA7c0M9Y18wPTElJW1fMD0xJSVmXzA9MiUlb18wPTglJXZfMD1iZW5lZGljdCB3ZWxscyUlZ18wPS0xJmFtcDtwYWdlSWQ9MiZhbXA7U3JjPTUmYW1wO1NyY0lkPTI%3d' title='Tochter des Marschlands (Roman - verfügbar)'>
                                        <img style='width:120px' data-fallback-src='https://www.stadtbibliothek.oldenburg.de/webopac/images/mediagrp/leer.png' 
                                            data-src='https://cover.winbiap.net/coverservices/getcover.ashx?x13=9783453427006&catid=120848&libid=OLD2&country=DE' 
                                            alt='Tochter des Marschlands'
                                            class='thumbCoverImageEager'
                                            data-mediagroup-src='https://www.stadtbibliothek.oldenburg.de/webopac/customers/oldenburg_wordpress/images/mediagrp/leer.png' />
                                        <span class='mediaStatus StatusAvailable status-1' title='Status: verfügbar'>verfügbar</span>
                                    </a>
                                </li><li>
                                    <a href='https://www.stadtbibliothek.oldenburg.de/webopac/detail.aspx?data=U29ydD1adWdhbmdzZGF0dW0gKEJpYmxpb3RoZWspJmFtcDtjbWQ9MSZhbXA7cFM9MTAmYW1wO0NhdGFsb2d1ZUlkPTExNTAyMSZhbXA7c0M9Y18wPTElJW1fMD0xJSVmXzA9MiUlb18wPTglJXZfMD1iZW5lZGljdCB3ZWxscyUlZ18wPS0xJmFtcDtwYWdlSWQ9MiZhbXA7U3JjPTUmYW1wO1NyY0lkPTI%3d' title='Zwei Wahrheiten (Roman - entliehen)'>
                                        <img style='width:120px' data-fallback-src='https://www.stadtbibliothek.oldenburg.de/webopac/images/mediagrp/leer.png' 
                                            data-src='https://cover.winbiap.net/coverservices/getcover.ashx?x13=9783311120612&catid=115021&libid=OLD2&country=DE' 
                                            alt='Zwei Wahrheiten'
                                            class='thumbCoverImageEager'
                                            data-mediagroup-src='https://www.stadtbibliothek.oldenburg.de/webopac/customers/oldenburg_wordpress/images/mediagrp/leer.png' />
                                        <span class='mediaStatus StatusNotAvailable status-2' title='Status: entliehen'>entliehen</span>
                                    </a>
                                </li><li>
                                    <a href='https://www.stadtbibliothek.oldenburg.de/webopac/detail.aspx?data=U29ydD1adWdhbmdzZGF0dW0gKEJpYmxpb3RoZWspJmFtcDtjbWQ9MSZhbXA7cFM9MTAmYW1wO0NhdGFsb2d1ZUlkPTExODA2MSZhbXA7c0M9Y18wPTElJW1fMD0xJSVmXzA9MiUlb18wPTglJXZfMD1iZW5lZGljdCB3ZWxscyUlZ18wPS0xJmFtcDtwYWdlSWQ9MiZhbXA7U3JjPTUmYW1wO1NyY0lkPTI%3d' title='Valentinstag (Roman - entliehen)'>
                                        <img style='width:120px' data-fallback-src='https://www.stadtbibliothek.oldenburg.de/webopac/images/mediagrp/leer.png' 
                                            data-src='https://cover.winbiap.net/coverservices/getcover.ashx?x13=9783446277328&catid=118061&libid=OLD2&country=DE' 
                                            alt='Valentinstag'
                                            class='thumbCoverImageEager'
                                            data-mediagroup-src='https://www.stadtbibliothek.oldenburg.de/webopac/customers/oldenburg_wordpress/images/mediagrp/leer.png' />
                                        <span class='mediaStatus StatusNotAvailable status-2' title='Status: entliehen'>entliehen</span>
                                    </a>
                                </li><li>
                                    <a href='https://www.stadtbibliothek.oldenburg.de/webopac/detail.aspx?data=U29ydD1adWdhbmdzZGF0dW0gKEJpYmxpb3RoZWspJmFtcDtjbWQ9MSZhbXA7cFM9MTAmYW1wO0NhdGFsb2d1ZUlkPTEwNzU0MyZhbXA7c0M9Y18wPTElJW1fMD0xJSVmXzA9MiUlb18wPTglJXZfMD1iZW5lZGljdCB3ZWxscyUlZ18wPS0xJmFtcDtwYWdlSWQ9MiZhbXA7U3JjPTUmYW1wO1NyY0lkPTI%3d' title='Lincoln Highway (Roman - verfügbar)'>
                                        <img style='width:120px' data-fallback-src='https://www.stadtbibliothek.oldenburg.de/webopac/images/mediagrp/leer.png' 
                                            data-src='https://cover.winbiap.net/coverservices/getcover.ashx?x13=9783446274006&catid=107543&libid=OLD2&country=DE' 
                                            alt='Lincoln Highway'
                                            class='thumbCoverImageEager'
                                            data-mediagroup-src='https://www.stadtbibliothek.oldenburg.de/webopac/customers/oldenburg_wordpress/images/mediagrp/leer.png' />
                                        <span class='mediaStatus StatusAvailable status-1' title='Status: verfügbar'>verfügbar</span>
                                    </a>
                                </li></ul>
                            </div>
                            <script>
                                $(document).ready(function() {
                                    var carousel = $('#suggestionCoverFlow').flipster({
                                        buttons: true,
                                        style: "flat",
                                        suppressempty: true,
                                        suppressempty_containerid: "ctl00_ContentPlaceHolderMain_divSuggestions",
                                        start: "center",
                                        spacing: 0,
                                        autoplay: 2000,
                                        loop: true,
                                        buttonPrev: 'Zurück',
                                        buttonNext: 'Weiter'
                                    });
                                });
                            </script>
                        </div>
                    </div>
                </div>
            </div>
            <div style="clear: both"></div>
            <script type="text/javascript">
                $(document).ready(function () {
                  $('#detail-left-affix').affix({
                    offset: {
                    top: function () {
                        return $('#DetailWrapper').offset().top - 20;
                    },
                    bottom: 20
                }
            });
            $('#nav-detail').affix({
                offset: {
                    top: function () {
                        return $('#DetailWrapper').offset().top + 8;
                    },
                    bottom: 70
                }
            });
            $('#detail-right-affix').affix({
                offset: {
                    top: function () {
                        return $('#DetailWrapper').offset().top - 58;
                    },
                    bottom: 70
                }
            });

            $("#ctl00_ContentPlaceHolderMain_ImagePermalink").popover({
                title: 'Teilen',
                content: $('#PermaPanel').html(),
                template:
                    '<div class="popover" onmouseover="$(this).mouseleave(function() {$(this).fadeOut(); });"><div class="arrow"></div><div class="popover-inner"><h3 class="popover-title"></h3><div class="popover-content"><p></p></div></div></div>',
                placement: 'left',
                html: true
            }).click(function (e) {
                e.preventDefault();
            }).mouseenter(function (e) {
                $(this).popover('show');
            }).mouseleave(function (e) {
                var elem = e.toElement || e.relatedTarget;
                if ($(elem).parents('.popover').length <= 0) {
                    setTimeout(" $(this).popover('hide');", 2000);
                }
            });

            $("a[rel=tooltip]").tooltip({
                placement: 'left'
            });

            $('#detailSeries-wrapper tr').hover(function () {
                    $('.smallDescription', $(this)).show();
                },
                function () {
                    $('.smallDescription', $(this)).hide();
                });


            $('.btn-divibib').addClass('btn-block');
        });
                $(document).keydown(function (event) {
                if (!$('input').is(':focus')) {
                    switch (event.keyCode) {
                    case 8:
                        $('#ctl00_ContentPlaceHolderMain_HyperLinkGoBack')[0].click();
                        return false;

                    case 39:
                        $('.nav-next')[0].click();
                        return false;

                    case 37:
                        $('.nav-prev')[0].click();
                        return false;

                    case 13:
                        if (!$('#loginBox').is(':visible')) {
                            $('.btn-reservation')[0].click();
                            return false;
                        }
                    }
                }
            });
            </script>
            
        

                        
                    </div>
                    
                </div>
                <div id="Navi" style="text-align: center;">

                    <a id="gototop" href="#top" class="GoTop"><small>Nach oben</small></a>

                </div>

                <div id="ctl00_modalCookieConsent" class="modal hide fade">    
                    <div class="modal-header">
                        <h3>Cookies und Analyse</h3>
                    </div>    
                    <div class="modal-body">         
                        <p>Wenn Sie Websites besuchen, können diese in Ihrem Browser Daten speichern oder abrufen. Das Speichern ist häufig für die grundlegende Funktionalität der Website erforderlich. Die gespeicherten Daten können für Marketing, Analyse und Personalisierung der Website verwendet werden, z. B. zum Speichern Ihrer bevorzugten Einstellungen. Der Datenschutz ist uns wichtig, daher haben Sie die Möglichkeit, bestimmte Speichertypen zu deaktivieren, die für die grundlegenden Funktionen der Website möglicherweise nicht erforderlich sind. Das Blockieren einiger Arten von Cookies kann sich auf Ihre Erfahrung auf der Website auswirken.</p>
                        <p><span class="aspNetDisabled"><input id="ctl00_cbConsentEssential" type="checkbox" name="ctl00$cbConsentEssential" checked="checked" disabled="disabled" /><label for="ctl00_cbConsentEssential">Essenziell</label></span></p>
                        <p>Diese Elemente sind erforderlich, um die grundlegende Funktionalität der Website zu aktivieren. Diese sind in der <a href='https://www.stadtbibliothek.oldenburg.de/webopac/privacy.aspx' target="_blank"><i class="fa fa-external-link"></i> Datenschutzerklärung</a> beschrieben.
                        </p>
                        
                    </div>
                    <div class="modal-footer">
                        <input type="submit" name="ctl00$btnConsentAcceptEssentialOnly" value="Nur Essenziell" id="ctl00_btnConsentAcceptEssentialOnly" class="btn" />
                        <input type="submit" name="ctl00$btnConsentAccept" value="Zustimmen" id="ctl00_btnConsentAccept" class="btn btn-primary" />
                    </div>
                </div>

                <div style="clear: both">                    
                    
                </div>
                <div id="Footer" class="hidden-print">
                    <div id="FooterSeperator"></div>
                    <small style="float: left; margin-left: 10px;" class="muted">&copy; datronicsoft IT Systems &#183; v4.7.3.5821</small>
                    <span class="muted" style="margin-right: 5%;">
                        <a href="https://www.stadtbibliothek.oldenburg.de/webopac/mobile/index.aspx?data=b3ZlcnJpZGVzZXR0aW5nPTE%3d" id="ctl00_GoToMobile">Mobile Version</a>
                        <span id="ctl00_spanFooterFirstDivider">&#183;</span>
                        <a id="impressum" href="https://www.stadtbibliothek.oldenburg.de/webopac/impressum.aspx">Impressum</a>
                        &#183;
                        <a id="privacy" href="https://www.stadtbibliothek.oldenburg.de/webopac/privacy.aspx">Datenschutzerkl&auml;rung</a>
                        <span id="ctl00_wrapperConsentAndAnalysis">
                        &#183;
                        <a href="#" id="ctl00_linkConsentAndAnalysis" role="button" data-toggle="modal">Cookies & Analyse</a>
                        </span>
                    </span>
                    
<div id="Textsize" class="Textsize">
    <a id="linkFontSizeBig" class="fontsize" data-value="1" title="Text größer" href="#">A+</a>
    <a id="linkFontSizeDefault" class="fontsize" data-value="-1" title="Text Normalgröße" href="#">A</a>
    <a id="linkFontSizeSmall" class="fontsize" data-value="2" title="Text kleiner" href="#">A-</a>
    <script type="text/javascript">
        $(document).on('click', '.fontsize', function (e) {
            e.preventDefault();
            
            var value = $(this).data('value');
            //Check for int
            if (value % 1 === 0) {
                SearchService.SetFontSizeState(value);
                var size = '';

                switch (value) {
                    case 1:
                        size = '1.2em';
                        break;
                    case 2:
                        size = '0.8em';
                        break;
                }

                $('form').css('font-size', size);
            }
        });
    </script>
</div>

                </div>
            </div>
        </div>
        </main>
    
<script type='text/javascript' src='https://www.stadtbibliothek.oldenburg.de/webopac/ctrl/search/Results/Views/List/ResultListMediaListView.js'></script><script type='text/javascript' src='https://www.stadtbibliothek.oldenburg.de/webopac/ctrl/search/Results/Views/List/ResultListMediaItemView.js'></script></form>
<div id="loginBox" class="loginBox">
    <form>
    <div class="loginForm">
        <div class="loginFormWrapper">
            <p class="lead text-center" style="margin-bottom: 0">In meinem Konto anmelden.</p>
            <hr/>
            <div class="loginBody">
                <fieldset class="loginFieldset">
                    <fieldset class="text-center">
                        <label for="username" class="text-left">
                            Nummer des Bibliotheksausweises:</label>
                        <input type="text" name="username" id="username"  />
                    </fieldset>
                    <fieldset class="text-center">
                        <label for="password" class="text-left">
                            Passwort:</label>
                        <input type="password" name="password" id="password" autocomplete="off" />
                    </fieldset>
                    <fieldset class="text-center">
                        <br />
                        <input id="popUpButtonLogon" class="btn btn-primary" type="button" value="Anmelden" style="width:10em" />
                    </fieldset>
                </fieldset>
                <div id="errorMessage" class="alert alert-error" style="display: none">
                </div>
                <div class="loginLoading" style="display: none">
                    <div class="spinner-container"></div>Anmeldung wird überprüft...
                </div>
            </div>
        </div>
    </div>
    <input type="hidden" id="returnUrlLoginPopupForm" value="https://www.stadtbibliothek.oldenburg.de/webopac/user/overview.aspx" />
    </form>
</div>
<script type="text/javascript">
    $(document).ready(function () {
        loginButtonPlugin = $('#popUpButtonLogon').loginAsync({
            serviceUserUrl: 'https://www.stadtbibliothek.oldenburg.de/webopac/service/UserService.ashx',
            usernameField: '#username',
            passwordField: '#password',
            errorObject: '#errorMessage',
            loginFormId: '#loginBox',
            redirectTo: 'https://www.stadtbibliothek.oldenburg.de/webopac/user/overview.aspx',
            redirectBadPasswordTo: 'https://www.stadtbibliothek.oldenburg.de/webopac/user/settings.aspx?data=dmlldz1wYXNzd29yZA%3d%3d',
            loginSuccessful: null,
        });
    });
</script>

<div id="ctl00_DiviBibManager_loginBoxDiviBib" class="loginBox" CliendIDMode="static">
    <form>
    <div class="loginForm">
        <div class="loginFormWrapper">
            <p class="lead text-center" style="margin-bottom: 0">In meinem Konto anmelden.</p>
            <p id="loginSuccessful" class="text-center" style="display: none; margin-bottom: 0">Bitte klicken Sie unten auf den Link.</p>
            <hr />
            <div class="loginBody">
                <fieldset class="loginFieldset">
                    <fieldset class="text-center">
                        <label for="username" class="text-left">
                            Nummer des Bibliotheksausweises:</label>
                        <input type="text" name="username" id="usernameDiviBib" />
                    </fieldset>
                    <fieldset class="text-center">
                        <label for="password" class="text-left">
                            Passwort:</label>
                        <input type="password" name="password" id="passwordDiviBib" autocomplete="false" />
                    </fieldset>
                    <fieldset class="text-center">
                        <br />
                        <input id="buttonLogonDiviBib" class="btn btn-primary" type="button" value="Anmelden" style="width: 10em" />
                    </fieldset>
                </fieldset>
                <div id="errorMessageDiviBib" class="alert alert-error" style="display: none">
                </div>
                <div class="loginLoading" style="display: none">
                    <div class="spinner-container"></div>
                    Anmeldung wird überprüft...
                </div>
                <div id="redirectToDiviBib" class="text-center" style="display: none">
                    <br />
                    <a id="buttonRedirect" class="btn btn-primary" href="#" style="width: 10em" target="_blank">Onleihe öffnen</a>
                </div>
            </div>
        </div>
    </div>
    <input type="hidden" id="returnUrl" value="https://www.stadtbibliothek.oldenburg.de/webopac/user/overview.aspx" />
    </form>
</div>
<script type="text/javascript">
    
    var ncipOptions = {
        loanUrl: "https://www.stadtbibliothek.oldenburg.de/webopac/user/divibib.aspx?data=cmVkaXJlY3RUb0RpdmlCaWI9MQ%3d%3d&itemId=",
        preBookUrl: "https://www.stadtbibliothek.oldenburg.de/webopac/user/divibib.aspx?data=cmVkaXJlY3RUb0RpdmlCaWI9MSZhbXA7cHJlYm9vaz0x&itemId=",
        serviceUrl: "https://www.stadtbibliothek.oldenburg.de/webopac/service/ncipservice.ashx",
        selector: ".divibib-async",
        userLoggedIn: false,
        userDiviBibConsent: false,
        blockAccess: false,
        callback: undefined
    }
    
    $(document).ready(function() {
        if (typeof ncipOptions.callback === "undefined") {
            ncipOptions.callback = function($elem, data) {
                if (data.Error) {
                    console.warn(data.Problem.ProblemDetail);
                } else {
                    if (data.MediaItem.Available) {
                        $elem.parent().find(".mediaStatus").html("verfügbar");
                        $elem.parent().find(".mediaStatus").addClass("StatusAvailable");

                        if (ncipOptions.userLoggedIn && !ncipOptions.blockAccess && ncipOptions.userDiviBibConsent) {
                            $elem.html("<i class='fa fa-at fa-fw'></i>&nbsp;Ausleihen");
                            $elem.attr('href', ncipOptions.loanUrl + data.MediaItem.ItemIdentifier);
                        }
                    } else {
                        $elem.parent().find(".mediaStatus").html("entliehen");
                        $elem.parent().find(".mediaStatus").addClass("StatusNotAvailable");

                        if (data.MediaItem.DateAvailable.length > 0 && data.MediaItem.DateAvailable !== '01.01.0001') {
                            $elem.parent().find(".mediaStatus").after(
                            "<br/><div class=\"DateofReturn\">(bis <span class=\"borrowUntil\" title=\"Entliehen bis: " +
                                data.MediaItem.DateAvailable +
                                "\">" +
                                data.MediaItem.DateAvailable +
                                "</span>)</div>");
                        }

                        if (data.MediaItem.Reservable && ncipOptions.userLoggedIn && !ncipOptions.blockAccess && ncipOptions.userDiviBibConsent) {
                            $elem.html("<i class='fa fa-at fa-fw'></i>&nbsp;Vorbestellen");
                            $elem.attr("href", ncipOptions.preBookUrl + data.MediaItem.ItemIdentifier);
                        }
                    }
                }
            };
        }

        $(ncipOptions.selector).ncip(ncipOptions.serviceUrl, ncipOptions.callback);
    });
</script>


    
    <script type="text/javascript" async="async">
        magnifierUrl = "https://www.stadtbibliothek.oldenburg.de/webopac/images/lightbox/magnifier.png";
        
        var rootUrl = "https://www.stadtbibliothek.oldenburg.de/webopac";
        SearchService.Init('https://www.stadtbibliothek.oldenburg.de/webopac/service/SearchService.ashx');
        Coverflow.init('https://www.stadtbibliothek.oldenburg.de/webopac/service/Coverflow.ashx', 'false');
        
        ;
        ;
        $('.selectpicker').selectpicker();

        $(document).on('click', '#gototop', function (e) {
            e.preventDefault();
            e.stopPropagation();

            window.scrollTo(0, 0);
        });

        $(window).on('beforeunload', function () {
            showLoadingMessage();;
        });

        $(document).on('click', '.morebutton', function () {
            var $link = $(this);
            var $more = $(this).prev(".more");

            $more.slideToggle('fast', function () {
                if ($(this).is(":hidden")) {
                    $link.text('mehr...');
                    $link.attr('title', 'Mehr Informationen anzeigen');
                }
                else {
                    $link.attr('title', 'Informationen ausblenden');
                    $link.html('...weniger');
                }
            });
        });

        var loadingMessage = 'Bitte warten.';
        var showLoadingMessage = function () {
            setTimeout(function () {
                if ($('.searchtext').length > 0) {
                    var autocomplete = $('.searchtext').autocomplete();
                    if (autocomplete) {
                        autocomplete.clear();
                    }
                }                       
            }, 4000);
        };

        function isIE11() {
            var onIE11 = !!window.MSInputMethodContext && !!document.documentMode, ua = window.navigator.userAgent;

            if (ua.indexOf("AppleWebKit") > 0) {
                return false;
            } else if (ua.indexOf("Lunascape") > 0) {
                return false;
            } else if (ua.indexOf("Sleipnir") > 0) {
                return false;
            }

            var array = /(msie|rv:?)\s?([\d\.]+)/.exec(ua);
            var version = (array) ? array[2] : '';
            return (parseInt(version) === 11) ? true : false;
        }

        $(document).ready(function () {
            if (isIE11() === true) {
                $('#DivWarningIE11').show();
            }        
            
        });
    </script>
    
<!--<a href="https://www.stadtbibliothek.oldenburg.de" id="ctl00_wpoverlaylink" class="wp-overlay" target="_self"><div style="align-content: center">Nicht das, was Sie suchen? Hier gelangen Sie zur Startseite der Stadtbibliothek Oldenburg</div></a>-->
    
        <script type="text/javascript">
            $(document).ready(function() {
                var WEBOPAC_DOMAIN = window.location.origin;
                var urlTopLocation = window.top.location + '';
                urlSplit = urlTopLocation.split( WEBOPAC_DOMAIN + '/webopac/');
                if ( urlSplit.length < 2 ) {
                    $('.wp-overlay').attr('style','visibility:hidden'); 
                } else {
                    window.location.href = WEBOPAC_DOMAIN;
                    $('.wp-overlay').hide();
                }
            });
        </script>
</body>
</html>
`
)
*/

