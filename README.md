# Exact Report Generator

The Exact Report Generator helps you quickly create financial reports based on your bookkeeping data in Exact Online. See a live version of the example report [here](https://exact-report-generator.vercel.app/reports/example-report/) (generated from [this](./reports/example_report.md) Markdown file)!

- Professional looking financial reports without the work.
- Quickly generate reports using handy macros to insert tables of your bookkeeping accounts & classifications.
- Print compatible.
- Markdown for easy formatting.
- Uses [Nunjucks](https://mozilla.github.io/nunjucks/) for more advanced templating.
- Generates sites using the [Lume](https://lumeland.github.io/) static site generator.

## Installation

1. Install [Deno](https://deno.land/#installation) and [Lume](https://lumeland.github.io/).
2. Clone this repostiory.
3. Run the program: `lume --config _config.ts`(, or `lume -s` to serve the reports as well.)
4. The site has now been built to `_site`.

(This project was tested using Deno v1.11.5 and Lume v0.25.2)

## License

This project is licensed under GPL-3.0.

## Usage Guide

Financial reports are generated using data obtained from the Exact Online API. The easiest way to download this data is using my [Exact Explorer tool](https://github.com/WilcoKruijer/ExactApiExplorer). After setting up, this tool has specific options to get data in the precise format that is used by this static site generator. The easiest way to get up-to-speed with this tool is to check out `example_report.md` in the `reports` folder. This report uses two data files, one file containing yearly results (`_data/example/report.json`), which contains all data in Exact's [balance sheet](https://support.exactonline.com/community/s/exact-online-help?cshid=FINBALANCESHEET). The second data file contains the budget scenario for the same year. [Budget scenarios](https://support.exactonline.com/community/s/knowledge-base#All-All-HNO-Task-financial-budget-finbdgt-crtbdgtscenariot) can be created within the Exact Online interface.


The header of a Markdown report file is the most important part of the document. It provides Lume with the data neccesary to create your report.

```yaml
title: Example Report
layout: layouts/base.njk
options:
    report: example/report.json
    budget: example/budget.json
templateEngine: njk,md
```
The title variable speaks for itself. Layout should not be changed when creating a report. The options object points Lume to the data files that should be used for this report. Note that a budget is not mandatory, this line can be omitted entirely. The `templateEngine` variable tells Lume to use both Nunjucks as well as Markdown. Without either one of these options reports cannot be generated.

After the triple dashes (`---`), the actual document starts. This document is created using Markdown [syntax](https://markdown-it.github.io/). Then there are a number of important macros that are used to actually create the tables with data.

* `{% balance "Assets", "Liabilities", options %}` renders the balance as available in your report data file. `Assets` is the name of the G/L account classification that represents the left side of the balance, while `Liabilities` is the name of the right side of the balance.
* `{% classification "General Costs", options %}` renders a table with result and budget data from G/L accounts within the classification. If a budget file is available it will also display that information. Note that budgets are matched on the `GLAccount` guid in the file, not by name.


The last `options` argument should always be present to indicate to Lume what data files are in use.