
        var SiteConfig = {"environment":"local"};

        var dojoConfig = {
          async: true,
          locale: 'en-us',
          useDeferredInstrumentation: true,
          packages: [{
            name: "calcite-web",
            location: "/assets/js",
            main: "calcite-web"
          }]
        };
      