---
title: Example Report
layout: layouts/base.njk
options:
    report: example/report.json
    budget: example/budget.json
templateEngine: njk,md
---

# {{ title }}

[[toc]]

## Introduction 🎉

This is an introduction to the example report. This can be used as a starting
point to create your own financial reports.

## Balance

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis ac scelerisque
ante, in tincidunt nisi. Aliquam laoreet mollis diam at laoreet. Aliquam erat
volutpat. Vivamus sit amet malesuada ex. Fusce venenatis vel dolor ac eleifend.
Nullam aliquet tincidunt elit quis tempor. Proin ac felis dui. Sed sodales leo
ligula, ut dapibus ante tempus et. Pellentesque vel nisi vitae lorem pharetra
efficitur vel ac mauris.

{% balance "Assets", "Liabilities", options %}

## Profit and Loss Statement

Markdown can be used to explain certain aspects of the profit and losses you
have made. Usual ~~syntax~~ _is_ **supported**.

{% classification "General Costs", options %}

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis ac scelerisque
ante, in tincidunt nisi. Aliquam laoreet mollis diam at laoreet. Aliquam erat
volutpat. Vivamus sit amet malesuada ex. Fusce venenatis vel dolor ac eleifend.
Nullam aliquet tincidunt elit quis tempor.

{% classification "Income", options %}

{% transactions ["example/transactions_gl1_2018.json",
"example/transactions_gl1_2017.json"] , "day" %}

{% set total_2017 = "example/transactions_gl1_2017.json" | load |
aggregate("year") | last %}

{% set total_2018 = "example/transactions_gl1_2018.json" | load |
aggregate("year") | last %}

As can be seen in the graphs, the total amount this year was {{
total_2018.amount | euro }} as opposed to {{ total_2017.amount | euro }} in the
previous year. A difference of {{ (total_2018.amount - total_2017.amount) | euro
}}!

{% classification "Miscellaneous Costs", options %}

Tables are also supported, they can be used to show various statistics:

| Product X sold   | **3.443** | X inventory start | **500** |
| ---------------- | --------- | ----------------- | ------- |
| Product X bought | **3.300** | X inventory end   | **130** |

This would mean `(3300 + 500 − 130) − 3443 = 227` products were lost or stolen.
(MathJax or similar is hopefully supported soon.)

This is the **END**.

##### Thanks for reading !

🔥🔥💯🔥💯👌👌
