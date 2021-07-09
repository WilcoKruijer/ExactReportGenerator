---
title: Jaarrekening 2018
layout: layouts/base.njk
options: { report: "2018/report.json", budget: "2018/budget.json" }
templateEngine: njk,md
---

# {{ title }}

## Introductie 🎉

Dit financiële jaarverslag hoort bij het eindejaarsverslag van bestuur 18 der
**via**. Hierin geef ik een overzicht van de inkomsten en uitgaven in het
afgelopen jaar. Deze financiële periode heeft gelopen vanaf 8 februari 2018 tot
en met 31 december 2018.

## Balans

De balans geeft een overzicht van de bezittingen, schulden en eigen vermogen van
de vereniging. De linkerkant (activa) geeft aan wat voor bezittingen wij hebben,
de rechterkant (passiva) geeft aan hoe we deze bezittingen hebben gefinancierd.
Onder de balans staat een uitleg van de verschillende posten.

{% balance "Assets", "Liabilities", options %}

## Winst- en verliesrekeningen

Dit gaat om de **Vervoerie**, :^).

{% classification "Vervoerscommissie", options %}

Er zijn nog meer commissies.

{% classification "Onderwijscommissie", options %}

{% classification "Liabilities", options %}

{% classification "Financieel opbrengsten en kosten", options %}
