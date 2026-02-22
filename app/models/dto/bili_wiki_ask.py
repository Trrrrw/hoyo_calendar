from pydantic import BaseModel


class BiliWikiAskResult(BaseModel):
    printouts: dict[str, list]


class BiliWikiAskQuery(BaseModel):
    results: dict[str, BiliWikiAskResult] | list


class BiliWikiAskResponse(BaseModel):
    query: BiliWikiAskQuery
