var render = function (theme, data, meta, require) {
    var assets = require('/helpers/myapps.js');
    var bodyContext = assets.currentPage(data.assets, data.sso, data.user, data.config, data.pagination.leftNav,
                                         data.pagination.rightNav, data.pagination.urlQuery, data.user);

    var hasApps = (data.assets.length > 0);

    var searchQuery = data.search.query;
    if (typeof(searchQuery) != typeof({})) {
        searchQuery = {overview_name: searchQuery, searchTerm: 'overview_name', search: searchQuery};
    } else {
        for (var key in searchQuery) {
            if (searchQuery.hasOwnProperty(key)) {
                if (key.indexOf("overview_") !== -1 && key.indexOf("overview_treatAsASite") == -1) {
                    searchQuery.searchTerm = key;
                    searchQuery.search = searchQuery[key];
                }
            }
        }
    }

    var leftNavigationData = [{
        active: true, partial: 'my-apps'
    }];
    if(data.user){
        leftNavigationData.push({
            active: false, partial: 'my-favorites'
        });
    }
    if(!data.navigation.showAllAppsLink){
        leftNavigationData.push({
            active: false, partial: 'all-apps'
        });
    }

    theme('2-column-left', {
        title: data.title,
        header: [
            {
                partial: 'header',
                context: data.header
            }
        ],
        leftColumn: [
            {
                partial: 'left-column',
                context: {
                    navigation: leftNavigationData,
                    tags: data.tags,
                    recentApps: require('/helpers/asset.js').formatRatings(data.recentAssets)
                }
            }
        ],
        search: [
            {
                partial: 'search',
                context: searchQuery
            }
        ],
        pageHeader: [
            {
                partial: 'page-header',
                context: {
                    title: "My Web Apps",
                    sorting: createSortOptions(data.user, data.config)
                }
            }
        ],
        pageContent: [
            {
                partial: 'page-content-myapps',
                context: bodyContext
            }
        ]
    });
};

function createSortOptions(user, config) {
    var isSelfSubscriptionEnabled = config.isSelfSubscriptionEnabled;
    var isEnterpriseSubscriptionEnabled = config.isEnterpriseSubscriptionEnabled;
    var url = "/extensions/assets/webapp/myapps?sort=";
    var sortOptions = {};
    var sortByPopularity = {url: url + "popular", title: "Sort by Popularity", class: "fw fw-star"};
    var sortByAlphabet = {url: url + "az", title: "Sort by Alphabetical Order", class: "fw fw-sort"};
    var sortByRecent = {url: url + "recent", title: "Sort by Recent", class: "fw fw-calendar"};
    var sortByUsage = {url: url + "usage", title: "Sort by Usage", class: "fw fw-statistics"};

    var options = [];

    if (!isSelfSubscriptionEnabled && !isEnterpriseSubscriptionEnabled) {
        options.push(sortByAlphabet);
        options.push(sortByRecent);// recently added
        options.push(sortByPopularity);
        if (user) {
            options.push(sortByUsage);
        }
    } else {
        if (user) {
            options.push(sortByAlphabet);
            options.push(sortByRecent);// recently subscribed
        }
    }

    sortOptions["options"] = options;
    return sortOptions;
}