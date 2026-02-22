from mwclient import Site


def get_site(path: str) -> Site:
    user_agent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:147.0) Gecko/20100101 Firefox/147.0"
    return Site(
        "wiki.biligame.com",
        path=path,
        clients_useragent=user_agent,
        connection_options={
            "headers": {
                "Referer": "https://wiki.biligame.com/ys/%E9%A6%96%E9%A1%B5",
                "Accept-Language": "zh-CN,zh;q=0.9",
            }
        },
    )
