# 学习路径接口约定

当前前端先走本地状态流转，后端接入时建议按下面结构返回。

## 1. 获取某个卡点的完整学习路径

`GET /api/student/learning-path?pointName=提炼转述困难`

返回建议：

```json
{
  "pointId": 2,
  "pointName": "提炼转述困难",
  "updatedAt": "2026-04-17T20:30:00.000Z",
  "stages": [
    {
      "stageKey": "diagnose",
      "stageName": "诊断",
      "stageIndex": 1,
      "status": "current",
      "groups": [
        {
          "groupKey": "default",
          "groupName": "诊断路径",
          "tasks": [
            {
              "taskId": "diagnose_group",
              "taskKey": "diagnose_group",
              "title": "诊断群",
              "status": "done",
              "actionType": "group",
              "resource": {
                "label": "加群按钮",
                "url": "https://..."
              }
            }
          ]
        }
      ]
    }
  ]
}
```

任务字段建议最少包含：

- `taskId`
- `taskKey`
- `title`
- `status`：`done | current | pending`
- `actionType`：`group | schedule | document | video | live | replay | upload | feedback | rating | report | processing | encourage`
- `resource`
- `secondaryAction`
- `uploads`
- `appointment`
- `result`

## 2. 更新任务状态

`PATCH /api/student/learning-path/tasks/:taskId`

请求体建议：

```json
{
  "pointName": "提炼转述困难",
  "stageKey": "theory",
  "status": "done",
  "appointment": {
    "date": "2026-04-18",
    "time": "19:00"
  },
  "rating": {
    "score": 5
  },
  "result": {
    "processingDone": true
  }
}
```

返回建议：

```json
{
  "ok": true,
  "taskId": "theory_handout",
  "status": "done",
  "updatedAt": "2026-04-17T20:35:00.000Z"
}
```

## 3. 上传类任务

上传类任务可以沿用现有 `POST /api/submissions`，建议补充这些字段：

- `pointName`
- `stageKey`
- `taskId`
- `taskKey`
- `reviewType`

示例：

```json
{
  "pointName": "提炼转述困难",
  "stageKey": "training",
  "taskId": "training_homework_upload",
  "taskKey": "training_homework_upload",
  "reviewType": "learning-path-upload"
}
```

## 4. 资源字段建议

`resource` 建议统一成：

```json
{
  "resourceType": "pdf",
  "title": "课前讲义",
  "url": "https://...",
  "videoId": "",
  "liveUrl": "",
  "replayUrl": "",
  "noteUrl": ""
}
```

这样前端可以统一处理：

- `pdf` -> `wx.downloadFile + wx.openDocument`
- `video` -> 录播页 / 视频容器
- `live` -> 直播链接
- `replay` -> 回放链接
- `feedback/report` -> 结果详情页
