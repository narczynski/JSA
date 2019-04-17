$(document).ready(function() {
	repair_hint_tree();
	init_dostawcy();
	// add_logo();
	init_przelewy();
    init_vat();
	init_duplikaty();
	duplicate_akceptuj_koszty_df();
	reInitDownloadData();

	if (isTableRow("Dokumenty") || isTableRow("Moje dokumenty")) {
		$(document).on('click', 'input.add_row', function(){
			// reset_ref_change(0);
			calculate_vat();
			});
	}
	if (isTableRow("Szablony - dokument")) {
		$(document).on('click', 'input.add_row', function(){
			// reset_ref_change(1);
            });
	}

	if (isEditInvoice()) {
		addLoader();
		var id = $('input:hidden[name=id]').val();
		if(id) {
			$.post("process_document.php?id="+id).done(function(data){
				if(data.refresh)
					location.reload();
			}).always(function(){
				$('#overlay').remove();
			});
		}
	}

	if (triggerTableAction('table', 'view', 'Eksport do OPTIMY')) {
		replace_action('optima_costs_generate_filtered.php', 'Eksportuj wyfiltrowane');
	}

	if (triggerTableAction('table', 'view', 'Eksport do OPTIMY - sprzedaże')) {
		replace_action('optima_sales_generate_filtered.php', 'Eksportuj wyfiltrowane');
	}

	if (triggerTableAction('table', 'table', 'Dokumenty')) {
		replace_action('optima_costs_cancel.php', 'Wyczyść datę eksportu');
	}

	if (triggerTableAction('table', 'table', 'Faktury')) {
		replace_action('optima_sales_cancel.php', 'Wyczyść datę eksportu');
	}

    if (triggerAction('edit_update', 'table', 'Konfiguracja')) {
        init_colour_picker();
    }
	
	bindStornoDocumentAcceptation();
	checkWarehouseDocumentState();
	initWarehouseReport();
	initWarehouseReport2();
});

$(document).on("load_script_ready", function(){
	change_summary_footer_location();
});

function initWarehouseReport(){
	if (isPivot("Raport wartościowy materiałów")) {
		$(".data_table tr:eq(0)").after("<tr></tr>");
		$(".data_table tr:eq(0) td").each(function() { $(".data_table tr:eq(1)").append("<td><div>Ilość</div><div>Wartość</div></td>"); });
		$(".data_table tr:eq(1) td:eq(0)").empty();

	$(".data_table tr:gt(0) td").css("min-width", "200px");
		$(".data_table tr:gt(0) td").find("div:eq(0)").css("float","left").css("margin-right","0px").css("min-width","100px");		
	}
}

function initWarehouseReport2(){
	if (isPivot("TABELA WZ A PZ")) {
		$(".data_table tr:eq(0)").after("<tr></tr>");
		$(".data_table tr:eq(0) td").each(function() { $(".data_table tr:eq(1)").append("<td><div>Ilość &nbsp; &nbsp; &nbsp;Wartość z PZ <br> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp;Wartość z WZ</div> </td>"); });
		$(".data_table tr:eq(1) td:eq(0)").empty();
		

	$(".data_table tr:gt(0) td").css("min-width", "50px");
		$(".data_table tr:gt(0) td").find("div:eq(0)").css("float","right").css("margin-left","1px").css("min-width","100px");		
	}	
}

function triggerTableAction(ep, vtable_type, vtable_name) {
	current_ep = $('input:hidden[name=ep]').val();
	current_vtable_type = $('input:hidden[name=vtable_type]').val();
	current_vtable_name = $('input:hidden[name=vtable_name]').val();

	return ep === current_ep && vtable_type === current_vtable_type && vtable_name === current_vtable_name;
}

function replace_action(new_action, action_title) {
	var ids = $('a', $('.data_table')[0]).map(function(n, e) {
		return e.href.match(/id=([0-9]+)/)[1];
	}).toArray();
	var url = './' + new_action + '?ids=' + ids.join(',');

	var old_action = $('.specific_actions li:first');
	old_action.before('<li><a href="' + url + '">' + action_title + '</a></li>');
	old_action.remove();
}

	function isTableEp(table, ep){
		var curTable = $('input:hidden[name=vtable_name]').val();
		var curEp = $('input:hidden[name=ep]').val();
		return table === curTable && ep === curEp;
	}
	
	function isPivot(name){
		var curName = $('#pivot_form input:hidden[name=name]').val();
		var curEp = $('#pivot_form input:hidden[name=ep]').val();
		return name === curName && "pivot_table_view" === curEp;
	}
	
	function isTableList() {
		return $('input:hidden[name=ep]').val() === 'table';
	}

	function isTableRow(table) {
		var curTable = $('input:hidden[name=vtable_name]').val();
		var curEp = $('input:hidden[name=ep]').val();
		return table === curTable && (curEp === "new_update" || curEp === "edit_update");
	}

	function isEditInvoice(){
		return isTableEp('Faktury', 'edit_update') || isTableEp('Faktura', 'edit_update') || isTableEp('Faktura Pro Forma', 'edit_update')
			 || isTableEp('Faktura Korekta', 'edit_update') || isTableEp('Faktura zaliczkowa', 'edit_update') || isTableEp('Niezapłacone faktury', 'edit_update');
	}

	function addLoader() {
		var over = '<div id="overlay" style="position: fixed;left: 0;top: 0;bottom: 0;right: 0;background: #000;opacity: 0.8;filter: alpha(opacity=80);">' +
			'<img id="loading" src="static/img/loader.gif" style="width: 50px;height: 57px;position: absolute;top: 50%;left: 50%;margin: -28px 0 0 -25px;">' +
			'</div>';
		$(over).appendTo('body');
		$('#overlay').click(function() {
			$(this).remove();
		});
	}

function duplicate_akceptuj_koszty_df() {
	if (isTableEp("Dokumenty do akceptacji - dyrektor", "edit_update")) {
		var input = $("input[type='submit'][value='Akceptuj koszty']");
		$(".DataForm").prepend("<div id='addButton' style='margin-top: 5px;'></div>");
		$("#addButton").append(input.clone());
	}
}

function init_duplikaty() {
	if (isTableRow("Dokumenty") || isTableRow("Moje dokumenty")) {
		var submit = $( "div :submit" )[0];
		if (submit.value == "Utwórz") {
			var btn = document.createElement("input");
			btn.type = "button";
			btn.value="Utwórz";
			btn.className="button";
			btn.onclick = function() {
				sprawdz_duplikaty();
			}
			submit.parentNode.appendChild(btn);
			submit.style.visibility = "hidden";
			submit.style.padding = "0";
			submit.style.width = "0";
			submit.style.minWidth = "0";
			submit.style.margin = "0";
		}
	}
}

function sprawdz_duplikaty() {
	var numer = document.getElementsByName("del__f_x__Numer%20dokumentu")[0];
	var dostawca = document.getElementsByName("extra_value__f_x__Dostawca")[0];
	$.post("get_doc_duplicate.php?numer="+encodeURIComponent(numer.value)+"&dostawca="+encodeURIComponent(dostawca.value)).done(function(data){
		if (data == 1) {
			alert("Duplikat rekordu istnieje w bazie - zweryfikuj");
		} else {
			var submit = $( "div :submit" )[0];
			submit.click();
		}
	}).error(function(){
		alert("Wystąpił problem podczas sprawdzania duplikatów");
	});
}

function init_dostawcy() {
	if (isTableRow("Dostawcy") || isTableRow("Wierzyciele") || isTableRow("Kontrahenci")) {
		add_weryfikator_konta();
		add_weryfikator_nip();
		add_weryfikator_duplikatow();
	}

	// loadScript("pickers.js", function(){});
	if (isTableEp('Dokumenty', 'edit_update') || isTableEp('Moje dokumenty', 'edit_update') || 
		isTableEp('Dokumenty do akceptacji - zarząd', 'edit_update') || isTableEp('Dokumenty do akceptacji - dyrektor', 'edit_update') || 
		isTableEp('Dokumenty w trakcie płatności', 'edit_update') || isTableEp('Dokumenty opłacone', 'edit_update') ||
		isTableEp('Zaległe płatności', 'edit_update') || isTableEp('Dokumenty do zapłaty', 'edit_update') ||
		isTableEp('Dokumenty w trakcie płatności', 'edit_update') || isTableEp('Do akceptacji - KP', 'edit_update') ||
		isTableEp('Wprowadzanie daty zapłaty', 'edit_update') || isTableEp('Kontrola duplikatów', 'edit_update') ||
		isTableEp('Eksport do OPTIMY', 'edit_update') || isTableEp('Niepoprawne dokumenty', 'edit_update') ||
		isTableEp('BR - Dokumenty kosztowe', 'edit_update')) {
			add_pdf_viewer();
	}
}

function add_weryfikator_konta() {
	var field = document.getElementsByName("del__f_x__Nr%20konta")[0];
	if (field === undefined)
		return;
	field.onkeyup = function(){
		var bank_ok = false;
		var numer_ok = false;

		var konto = field.value.replace(/ /g, "");
		if (konto.length == 26) {
			var bank = konto.substring(2, 10);
			var key = [7,1,3,9,7,1,3];
			var result = 0;
			for (var i = 0; i < 7; i++) {
				result += (parseInt(bank.charAt(i)) * key[i]);
			}
			bank_ok = (result % 10 == parseInt(bank.charAt(7)))

			var temp = konto.substring(2, 26) + "2521" + konto.substring(0, 2);

			var modulo = parseInt((parseInt((parseInt((parseInt(temp.substring(0,10)) % 97).toString() + temp.substring(10,17)) % 97).toString() + temp.substring(17,24)) % 97).toString() + temp.substring(24,30)) % 97;
			numer_ok = modulo == 1;
		}

		var maska_ok = true;
		konto = field.value;
		for (var i = 0; i < konto.length; ++i) {
			if ((i == 2) || ((i - 2) % 5 == 0)) {
				maska_ok = konto.charAt(i) == ' ' && maska_ok;
			}
		}
		$(field).siblings('input[type=hidden]').first().val(this.value).change();
		field.style.background = bank_ok && numer_ok && maska_ok ? "#81F781" : "#F78181";
	};
}

function add_weryfikator_nip() {
	var field = document.getElementsByName("del__f_x__NIP")[0];
	if (field === undefined)
		return;
	field.onkeyup = function() {
		var nip = field.value;
		var length = nip.length;
		var nip_ok = false;

		if ((length == 10) || (length == 12)) {
			nip_ok = true;

			var i = 0;
			if (length == 12) {
				console.log(nip.substring(0, 2));
				nip_ok = nip.substring(0, 2).match(/[A-Z]{2}/);
				i = 2;
			}

			while (i < length) {
				if (isNaN(parseInt(nip.charAt(i)))) {
					nip_ok = false;
				}

				++i;
			}
		}
		$(field).siblings('input[type=hidden]').first().val(this.value).change();
		field.style.background = nip_ok ? "#81F781" : "#F78181";
	};
}

function add_weryfikator_duplikatow() {
	configure_field('del__f_x__NIP');
	configure_field('del__f_x__Nr%20konta');
}

function configure_field(input_name) {
	var el = document.getElementsByName(input_name)[0];
	if (el === undefined)
		return;
	el.onchange=function(){
		get_duplicate_state(input_name, this.value);
	};

	var img = document.createElement('img');
	img.id = input_name + '_img';
	img.src = 'warning.png';
	img.title = 'Rekord z taką wartością już istnieje w bazie';
	img.style.display = 'none';
	el.parentNode.appendChild(img);
}

function get_duplicate_state(input_name, str) {
	var xmlhttp;

	if (str=="") {
		document.getElementById(input_name + "_img").style.display="none";
		return;
	}
	if (window.XMLHttpRequest) {
		xmlhttp=new XMLHttpRequest();
	} else {
		xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xmlhttp.onreadystatechange=function() {
		if (xmlhttp.readyState==4 && xmlhttp.status==200) {
			document.getElementById(input_name + "_img").style.display=xmlhttp.responseText;
		}
	}
	xmlhttp.open("GET","get_duplicate.php?field="+input_name+"&value="+str,true);
	xmlhttp.send();
}

function add_logo() {
	var xmlhttp;

	if (window.XMLHttpRequest) {
		xmlhttp=new XMLHttpRequest();
	} else {
		xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xmlhttp.onreadystatechange=function() {
		if (xmlhttp.readyState==4 && xmlhttp.status==200) {
			var newdiv = document.createElement('div');
			newdiv.setAttribute('id','logo_element');
			newdiv.innerHTML = xmlhttp.responseText;
			$('.menu').prepend(newdiv);
		}
	}
	xmlhttp.open("GET","get_logo.php",true);
	xmlhttp.send();
}

function init_przelewy() {
	if (isTableEp("Dokumenty do zapłaty", "table")) {
		var el = $(".specific_actions li:first");
		el.before("<li><a onclick='filtered_action(\"generuj_przelewy.php\");' style='cursor: pointer;'>Generuj przelewy</a></li>");
		el.remove();
	}
}
function init_optima() {
	if (window.location.search.match(/ep=table/) &&
		window.location.search.match(/vtable_name=Dokumenty%20archiwalne/)) {
		var el = $(".specific_actions li:first");
		el.before("<li><a onclick='filtered_action(\"eksport_optima.php\");' style='cursor: pointer;'>Eksportuj do OPTIMA</a></li>");
		el.remove();
	}
}

function filtered_action(action) {
	var ids = $("a", $(".data_table")[0]).map(function(n, e){return e.href.match(/id=([0-9]+)/)[1];}).toArray();
	var url = "./"+action+"?id[]=" + ids.join("&id[]=");
	window.location = url;
}

// function reset_ref_change(it) {
	// var elem1_src = ['added_xrow__tableRozbicie%20dokumentu__Projekt__new' , 'added_xrow__tableSzablony%20-%20rozbicie%20dokumentu__Projekt__new'];
	// var elem1_dest = ['extra_value__added_xrow__tableRozbicie%20dokumentu__Rodzaj%20kosztu__' , 'extra_value__added_xrow__tableSzablony%20-%20rozbicie%20dokumentu__Rodzaj%20kosztu__'];
	// var elem2_src = ['added_xrow__tableRozbicie%20dokumentu__Rodzaj%20kosztu__new', 'added_xrow__tableSzablony%20-%20rozbicie%20dokumentu__Rodzaj%20kosztu__new'];
	// var elem2_dest = ['extra_value__added_xrow__tableRozbicie%20dokumentu__Kategoria__', 'extra_value__added_xrow__tableSzablony%20-%20rozbicie%20dokumentu__Kategoria__'];
	// var elem3_src = ['added_xrow__tableRozbicie%20dokumentu__Kategoria__new', 'added_xrow__tableSzablony%20-%20rozbicie%20dokumentu__Kategoria__new'];
	// var elem3_dest = ['extra_value__added_xrow__tableRozbicie%20dokumentu__Podkategoria__', 'extra_value__added_xrow__tableSzablony%20-%20rozbicie%20dokumentu__Podkategoria__'];

	// //for (var it = 0; it < 2; it++) {
		// var el_new1 = elem1_dest[it];
		// var el_new2 = elem2_dest[it];
		// var el_new3 = elem3_dest[it];
		// var elems1 = [];
		// var elems2 = [];
		// var elems3 = [];
		// var inputs = document.getElementsByTagName("input");
		// for(var i = 0; i < inputs.length; i++) {
			// if(inputs[i].name.indexOf(elem1_src[it]) == 0) {
				// elems1.push(inputs[i]);
			// }
			// if(inputs[i].name.indexOf(elem2_src[it]) == 0) {
				// elems2.push(inputs[i]);
			// }
			// if(inputs[i].name.indexOf(elem3_src[it]) == 0) {
				// elems3.push(inputs[i]);
			// }
		// }
		// if (elems1 !== undefined)
			// for(i = 0; i < elems1.length; i++) {
				// elems1[i].onchange = function () { init_autocomplete_suggestion_for_field(this, 'view', 'Aktywne projekty', 'Projekt', [[ 'Typ', el_new1]]); };
			// }
		// if (elems2 !== undefined)
			// for(i = 0; i < elems2.length; i++) {
				// elems2[i].onchange = function () { if (this.value == 3 || this.value == 5 || this.value == 7 || this.value == 8 || this.value == 9 || this.value == 15 || this.value == 16 || this.value == 17 || this.value == 19 || this.value == 20) init_autocomplete_suggestion_for_field(this, 'table', 'Rodzaje kosztów', 'Rodzaj kosztu', [[ 'Typ+numer', el_new2]]); };
			// }
		// if (elems3 !== undefined)
			// for(i = 0; i < elems3.length; i++) {
				// elems3[i].onchange = function () { init_autocomplete_suggestion_for_field(this, 'table', 'Kategorie kosztów', 'Kategoria', [[ 'Typ', el_new3]]); };
			// }

	// //}
// }

function init_vat() {
	var netto_f = $("input[name*='del__edit_xinline__new_xval__tableRozbicie%20dokumentu__Warto%c5%9b%c4%87%20netto__']");
	var stawka_f = $("input[name*='extra_value__edit_xinline__new_xval__tableRozbicie%20dokumentu__Stawka%20VAT__']");
	var vat_f = $("input[name*='del__edit_xinline__new_xval__tableRozbicie%20dokumentu__Warto%c5%9b%c4%87%20VAT__']");
	netto_f.each(function( index ) {
		var func = function() {
			var netto = parseFloat($(netto_f[index]).val().replace(',', '.').replace(/\s+/g, ''));
			var stawka = parseFloat($(stawka_f[index]).val().replace(',', '.'));
			var vat = (Math.round(netto * stawka) / 100).toFixed(2); // due to the inaccuracy of precision
			if (!isNaN(vat)) {
				vat = ('' + vat).replace('.', ',');
				$(vat_f[index]).val(vat).change();
			}
		};
		$(netto_f[index]).change(func);
		$(stawka_f[index]).focusout(func);
	});
}

function calculate_vat() {
	var netto_f = $("input[name*='del__added_xrow__tableRozbicie%20dokumentu__Warto%c5%9b%c4%87%20netto__new']");
	var stawka_f = $("input[name*='extra_value__added_xrow__tableRozbicie%20dokumentu__Stawka%20VAT__new']");
	var vat_f = $("input[name*='del__added_xrow__tableRozbicie%20dokumentu__Warto%c5%9b%c4%87%20VAT__new']");
	netto_f.each(function( index ) {
		var func = function() {
			var netto = parseFloat($(netto_f[index]).val().replace(',', '.'));
			var stawka = parseFloat($(stawka_f[index]).val().replace(',', '.'));
			var vat = (Math.round(netto * stawka) / 100).toFixed(2); // due to the inaccuracy of precision
			if (!isNaN(vat)) {
				vat = ('' + vat).replace('.', ',');
				$(vat_f[index]).val(vat).change();
			}
		};
		$(netto_f[index]).change(func);
		$(stawka_f[index]).focusout(func);
	});
}

function add_pdf_viewer() {
	var res = [];
	res[0] = add_pdf_viewer_button('Skan faktury');
	res[1] = add_pdf_viewer_button('Dokument magazynowy');
	res[2] = add_pdf_viewer_button('Protokół odbioru');
	res[3] = add_pdf_viewer_button('Zamówienie');
	res[4] = add_pdf_viewer_button('inny zalacznik');
	
	var pdf = false;
	var url = "";
	for (var i = 0; i < 5; i++) {
		if (res[i].pdf) {
			pdf = true;
			url = res[i].url;
			break;
		}
	}
	
	if (pdf) {
		$(".inner_column").css({"margin-right":"100px"});
		var file = $(".file");
		var row = file[0].parentNode.insertRow(5);
		var cell = row.insertCell(0);
		cell.colSpan = 2;

		cell.innerHTML = "<iframe id='pdf_viewer' src = '" + url + "' width='500' height='500' allowfullscreen webkitallowfullscreen></iframe>";
	}
}

function add_pdf_viewer_button(field) {
	var href = $("[data-columnname-0=\":field('" + field + "')\"]").find("div[node_type='edit'] a")[0];
	var url1 = href.href.substring(0, href.href.indexOf("index."));
	var url2 = href.href.substring(href.href.indexOf("index."));
	var doc_name = href.innerHTML;
	var ext = doc_name.toLowerCase().substring(doc_name.toLowerCase().indexOf("pdf"));
	
	var url = url1 + "/ViewerJS/#../" + url2 + "&doc_name=" + doc_name;
	
	if (doc_name != "" && ext == "pdf") {
		var edit_node = $("[data-columnname-0=\":field('" + field + "')\"]").find("div[node_type=edit]");
		$(edit_node.find("div")[0]).css('float','left').css('width','60%');
		$(edit_node.children("input")[0]).css('width','60%');
		$(edit_node.find("div")[0]).after("<div class='node button' style='float:right' " +
			"onclick='show_pdf_preview(\"" + url + "\");'>Wyświetl podgląd</div>");
		
		return { pdf : true, url : url };
	}
	return { pdf : false };
}

function show_pdf_preview(url) {
	$("iframe[id=pdf_viewer]").attr('src', url);
	document.getElementById("pdf_viewer").contentDocument.location.reload(true);
}

$(function() {
    $("td.file a").each(function(){
		var b = $(this);
		var u = b.text();
		var width;
		var border;
	    width = 50;
	    border = 1;
		if ((u.substr(-4).toLowerCase() == '.jpg' || u.substr(-4).toLowerCase() == '.png' || u.substr(-4).toLowerCase() == '.bmp')) {
			b.replaceWith("<a href='" + b.attr("href") + "'><img src='" + b.attr("href")
				  + "' style='width: " + width + "px; border: " + border + "px solid #2C7CBB;'\></a>");
		}

	});

	$("tr.file a").each(function(){
	var b = $(this);
	var u = b.text();
	var width;
	var border;
	if(u.substr(0, 3) == '___'){
	    width = 50;
	    border = 1;
	}
	else{
	    width = 300;
	    border = 4;
	}
	if ((u.substr(-4).toLowerCase() == '.jpg' || u.substr(-4).toLowerCase() == '.png' || u.substr(-4).toLowerCase() == '.bmp')) {
	    b.replaceWith("<a href='" + b.attr("href") + "'><img src='" + b.attr("href")
			  + "' style='width: " + width + "px; border: " + border + "px solid #2C7CBB;'\></a>");
	}})

	$("input").each(function(){
	    if($(this).attr('type') == "file" && $(this).attr('disabled') == "disabled"){
	    $(this).remove();
	    }
	}
	)


});


function loadScript(url, callback)
{
    // Adding the script tag to the head as suggested before
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;

    // Then bind the event to the callback function.
    // There are several events for cross browser compatibility.
    script.onreadystatechange = callback;
    script.onload = callback;

    // Fire the loading
    head.appendChild(script);
}

function triggerAction(ep, vtable_type, vtable_name) {
	var current_ep = $('input:hidden[name="ep"]').val();
	var current_vtable_type = $('input:hidden[name="vtable_type"]').val();
	var current_vtable_name = $('input:hidden[name="vtable_name"]').val();

	return (ep === current_ep) && (vtable_type === current_vtable_type) && (vtable_name === current_vtable_name);
}

function init_colour_picker() {
    $.getScript('jscolor.min.js');
    var colorPicker = $('input[name$="Kolor"]');
    colorPicker.addClass('jscolor');
}

function repair_hint_tree() {
	fmt_fc_is_set = false;
}

function change_summary_footer_location() {
	if (!isTableList())
		return;
	var tfoot = $(".data_table tfoot tr");
	if(tfoot.length == 0 )
		return;
	$(".data_table:eq(0) thead").append(tfoot);
	tfoot.find("td").css('white-space','nowrap');
	$(".data_table:eq(1)").prepend('<div style="height: 21px;"></div>');
}

function reInitDownloadData() {
	var old_fmt_fc_updateRefData = fmt_fc_updateRefData;
	
	fmt_fc_updateRefData = function(uid) {
		if (fmt_fc_custom_download(uid)) {
			var valid = fmt_fc_custom_download_valid(uid);
			if (valid.res) {
				var params = fmt_fc_custom_download_params(uid);
				fmt_fc_updateRefData_Lucatel(uid, params);
			} else {
				fmt_fc_updateRefData_Lucatel_error(uid, valid.msg);
			}
		} else {
			old_fmt_fc_updateRefData(uid);
		}
	}
}

function fmt_fc_custom_download_valid(uid) {
	if (is_towar_in_dokumenty_magazynowe(uid)) {
		var src = $("[data-columnname-0*='magazyn zrodlowy'] div[node_type='edit']").children("input[type='hidden']").val();
		var dest = $("[data-columnname-0*='magazyn docelowy'] div[node_type='edit']").children("input[type='hidden']").val();
		var res = (src == undefined || src != '') && (dest == undefined || dest != '');
		var msg = (src == '' ? 'Wybierz magazyn źródłowy. ' : '') + (dest == '' ? 'Wybierz magazyn docelowy. ' : '');
		return create_valid_msg(res, msg);
	} else if (is_pozycje_pz_in_koszt(uid)) {
		return create_valid_msg(true, '');
	}
	return create_valid_msg(false, '');
}

function create_valid_msg(res, msg) {
	return { res: res, msg: msg };
}

function fmt_fc_custom_download(uid) {
	if (is_towar_in_dokumenty_magazynowe(uid) ||
		is_pozycje_pz_in_koszt(uid))
		return true;
	return false;
}

function fmt_fc_custom_download_params(uid) {
	var params = {};
	if (is_towar_in_dokumenty_magazynowe(uid)) {
		params.method = 'towar_dla_dokumentu';
		params.doc_type = $("[data-columnname-0*='typ dokumentu magazynowego'] div[node_type='edit']").children("input[type='hidden']").val();
		params.warehouse_src = $("[data-columnname-0*='magazyn zrodlowy'] div[node_type='edit']").children("input[type='hidden']").val();
		params.warehouse_dest = $("[data-columnname-0*='magazyn docelowy'] div[node_type='edit']").children("input[type='hidden']").val();
	}
	if (is_pozycje_pz_in_koszt(uid)) {
		params.method = 'pozycja_dla_kosztu';
		params.parent_id = $("[data-columnname-0*='Dokument'] div[node_type='edit']").children("input[type='hidden']").val();
	}
	return params;
}

function is_towar_in_dokumenty_magazynowe(uid) {
	if (isTableRow("dokumenty magazynowe")) {
		return ($("#" + uid).closest("div[data-wrapper=\"group\"]").attr("data-groupname") == 'pozycje') &&
			($("#" + uid).closest(".fmt_fc_wrapper").attr("vtable_name") == "Towar");
	}
	return false;
}

function is_pozycje_pz_in_koszt(uid) {
	if (isTableRow("Wszystkie koszty") || isTableRow("Koszty do akceptacji")) {
		return ($("#" + uid).closest("div[data-wrapper=\"group\"]").attr("data-groupname") == 'Pozycje z dokumentów PZ') &&
			($("#" + uid).closest(".fmt_fc_wrapper").attr("vtable_name") == "Pozycje PZ - niepowiązane");
	}
	return false;
}

function fmt_fc_updateRefData_Lucatel(uid, params) {
	if (fmt_fc_state[uid] == 'waiting') {
		if (fmt_fc_isFocused(uid)) {
			fmt_fc_state[uid] = 'search';
			var val = fmt_fc_is_set[uid] ? '' : $("#" + uid).val();
			fmt_fc_setStatus(uid, fmt_fc_state[uid] + " '" + val + "'");
			fmt_fc_displayInDiv(uid, fmt_fc.searching + '...');
			$.ajax({
				type: "GET",
				url: "get_data.php",
				data: params,
				dataType: 'json',
				success: function(data) {
					if (data == null) {
						if (fmt_fc_state[uid] == 'search') {
							fmt_fc_updateRefData_Lucatel_error(uid, 'PHP zwrócił null!');
						}
					} else if (fmt_fc_state[uid] == 'search') {
						fmt_fc_state[uid] = 'idle';
						fmt_fc_setStatus(uid, fmt_fc_state[uid]);
						fmt_fc_ref_data[uid] = data;
						console.log(data);
						fmt_fc_updateControls(uid);
						fmt_fc_updateInputElement(uid);
					} else if (fmt_fc_state[uid] == 'next_search') {
						fmt_fc_state[uid] = 'waiting';
						fmt_fc_setStatus(uid, fmt_fc_state[uid]);
					} else if (fmt_fc_state[uid] == 'next_search_waiting_for_request') {
						fmt_fc_state[uid] = 'waiting';
						fmt_fc_updateRefData(uid);
					}
				},
				error: function() {
					if (fmt_fc_state[uid] == 'search') {
						fmt_fc_updateRefData_Lucatel_error(uid, fmt_fc.error_downloading_data);
					}
				}
			});
		} else {
			fmt_fc_state[uid] = 'idle';
			fmt_fc_setStatus(uid, fmt_fc_state[uid]);
		}
	} else if (fmt_fc_state[uid] == 'next_search') {
		fmt_fc_state[uid] = 'next_search_waiting_for_request';
		fmt_fc_setStatus(uid, fmt_fc_state[uid]);
		fmt_fc_displayInDiv(uid, fmt_fc.searching + '.');
	}
}

function fmt_fc_updateRefData_Lucatel_error(uid, msg) {
	fmt_fc_state[uid] = 'idle';
	fmt_fc_setStatus(uid, fmt_fc_state[uid]);
	fmt_fc_displayInDiv(uid, '<a style="color: red;">' + msg + '<a/>');
}

function checkWarehouseDocumentState() {
	if (isStornoDocument()) {
		return;
	}
    if (isTableEp("dokumenty magazynowe", "edit_update") ||
    	isTableEp("Dokumenty do akceptacji", "edit_update") ||
        isTableEp("dokumenty pz", "edit_update") ||
        isTableEp("dokumenty wz", "edit_update") ||
        isTableEp("dokumenty mm", "edit_update") ||
        isTableEp("dokumenty rw", "edit_update")) {

		blockFormIfNeeded();
        sendCheckStateRequest("update_warehouse_doc.php");
    }
    if (isTableEp("zamowienia", "edit_update")) {
        sendCheckStateRequest("generate_warehouse_doc.php");
    }
}

function bindStornoDocumentAcceptation() {
	if (isStornoDocument()) {
		blockFormIfNeeded();
		$('.node.button.add_row').remove();
		$('.node.remove_row').remove();
		if ($('input[name*=\"del__f_x__workflow\"]').val() == 'akceptacja') {
			checkRevisingStornoDocument();
		}
	}
}

function checkRevisingStornoDocument() {
	if (isStornoDocument()) {
		sendCheckStateRequest("update_storno_warehouse_doc.php");
		$('#overlay').remove();
	}
}

function isStornoDocument() {
	res = false;
	$('input[name*=\"extra_value__f_x__typ\"]').each(function() {
		res = res || ($(this).val().includes("Storno"));
	})
	return res;
}

function blockFormIfNeeded() {
    addLoader();
	var editable = $("[data-groupname=\"moge_edytowac\"]").find("div [node_type=edit] input[type=hidden]").val() =="1";
	$("[data-groupname=\"moge_edytowac\"]").remove();
	if (!editable)
		$(".node .buttons_wrapper").remove();
	$('#overlay').remove();
}

function sendCheckStateRequest(url) {
    addLoader();
    var id = $('input:hidden[name=id]').val();
    if (id) {
        $.get(url + "?id=" + id)
            .done(function (data, status) {
            	if (status == "error") {
            		alert('Wystąpił nioczekiwany błąd: 0x1. Status: error.');
            	}
            	try {
            		data = jQuery.parseJSON(data);
            	}
            	catch (err) {
            		alert('Wystąpił nioczekiwany błąd: 0x2. Bardzo prosimy o zgłoszenie do administratora. Błąd:' + err);
            	}
				if (data.is_error) {
					if (!window.location.href.includes('&msg=')) {
						window.location.href = window.location.href + "&msg=" + data.msg;
					}
				} else if (data.refresh)
                    location.reload();
            }).always(function () {
                $('#overlay').remove();
            });
    }
}