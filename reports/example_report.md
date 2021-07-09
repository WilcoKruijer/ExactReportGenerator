---
title: Example Report
layout: layouts/base.njk
options:
    report: example/report.json
    budget: example/budget.json
templateEngine: njk,md
---

# {{ title }}

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

{% classification "Miscellaneous Costs", options %}

This is the **END**.

##### Thanks for reading !

🔥🔥💯🔥💯👌👌
