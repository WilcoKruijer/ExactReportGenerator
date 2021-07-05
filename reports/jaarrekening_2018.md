---
title: Jaarrekening 2018
layout: layouts/base.njk
dataFile: 2018_full
templateEngine: njk,md
---

# {{ title }}

## Balans

{% balance dataFile, "Assets", "Liabilities" %}

## Winst- en verliesrekeningen

Dit gaat om de **Vervoerie**, de beste commissie.

{% classification dataFile, "Vervoerscommissie" %}

Er zijn nog meer commissies :^).

{% classification dataFile, "Onderwijscommissie", { a: 3 } %}

{% classification dataFile, "Liabilities", { a: 3 } %}
