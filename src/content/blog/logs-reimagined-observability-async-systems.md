---
title: "Logs Reimagined: Elevating Observability & Debugging in Asynchronous Systems"
date: 2025-02-10
category: Tech
tags: [python, logging, observability, asyncio]
summary: "How we turned logs in an asynchronous Python system into a developer's most powerful ally."
draft: false
---

*Originally published on the [Observe.AI engineering blog](https://www.observe.ai/blog/logs-reimagined-elevating-observability-debugging-in-asynchronous-systems).*

![Logs Reimagined: Elevating Observability & Debugging in Asynchronous Systems](/blog/logs-reimagined-cover.jpg)

In Python's asynchronous systems, debugging can feel like navigating uncharted waters. Asynchronous Python applications introduce unique challenges to logging. Traditional logging modules like `logging` work well for sequential applications, offering traceback and context. However, asynchronous systems and third-party libraries such as pydantic exposed several shortcomings:

- **Loss of context in asynchronous workflows:** Standard logs didn't provide continuity across asynchronous calls. Developers couldn't tie logs back to user interactions, API calls, or related workflows, complicating debugging for multi-step operations.
- **Fragmented log formats:** Libraries like Pydantic used their own logging formats, which lacked critical metadata (e.g., user ID or interaction ID). This inconsistency made it too challenging to visualize an API lifecycle from start to finish across multiple components.
- **Insufficient metadata:** While standard logs provided function names, file names, and line numbers, they couldn't automatically attach contextual information like the current user or interaction ID, especially at the time of error tracing.

These limitations called for a new approach: contextual, unified, and rich logs designed for asynchronous workflows.

## Our solution: contextual, unified logging

We adopted Loguru, a powerful logging library, as the foundation for our enhanced system. Its features (dynamic context binding, easy format customization, and rich record objects) helped us address the challenges of asynchronous logging effectively.

### 1. Context-enriched logs with `bind()`

Loguru's `bind()` method allowed us to dynamically attach contextual metadata (e.g., `interaction_id`, `user_id`, `account_id`) to logs without requiring manual tagging for every log statement. Using Python's `ContextVar`, we dynamically injected this metadata into logs at runtime. This allowed every log entry to carry the context of the ongoing asynchronous operation, creating a breadcrumb trail developers could follow.

To further enhance traceability, we utilized module-specific scoping. By passing the module name to the `bind()` method, we categorized logs by their originating module, creating a clear distinction between logs from different parts of the application. This not only helped in segregating logs but also provided developers with a concise way to identify the source of an issue.

```python
def get_logger_with_interaction_id(module_name: str = None):
    contextual_logger = logger.bind()
    interaction_id = interaction_id_var.get()
    if interaction_id:
        contextual_logger = contextual_logger.bind(interaction_id=interaction_id)
    if module_name and module_name == "peregrine_backend.api":
        current_user_id = current_user_id_var.get()
        account_id = account_id_var.get()
        if current_user_id:
            contextual_logger = contextual_logger.bind(current_user_id=current_user_id)
        if account_id:
            contextual_logger = contextual_logger.bind(account_id=account_id)
    return contextual_logger
```

Benefits:

- Automatic association of logs with user and interaction details.
- Simplified debugging by eliminating guesswork about log origin.

### 2. Unified log format

We defined a consistent log format that included full trace information (`module:function:line`), contextual metadata, and user/account details for API-related logs.

```python
def construct_log_format(record):
    base_format = "{extra[TRACE]} | {extra[module_tag]} | {level} | {message}"
    extra_fields = []
    if record["extra"].get("interaction_id"):
        extra_fields.append("{extra[interaction_id]}")
    if record["extra"].get("module_tag") == "API":
        if record["extra"].get("current_user_id"):
            extra_fields.append("user_id : {extra[current_user_id]}")
        if record["extra"].get("account_id"):
            extra_fields.append("acc_id : {extra[account_id]}")
    if extra_fields:
        base_format += " | " + " | ".join(extra_fields)
    return base_format
```

Benefits:

- **Full trace:** pinpoint errors with module, function, and line details.
- **Lifecycle tracking:** tie logs to specific user interactions or API calls.
- **Consistency:** a unified format across the entire application, including third-party libraries.

### 3. Patching third-party libraries (e.g., Pydantic)

To harmonize Pydantic logs with our enriched format, we monkey-patched its logger dynamically. By recursively patching submodules, we ensured that Pydantic logs followed the same structure as our application logs.

```python
def patch_pydantic_loggers():
    def recursive_logger_patch(package):
        if hasattr(package, "logger"):
            package.logger = get_logger_with_interaction_id("pydantic")
        for _, module_name, is_pkg in pkgutil.walk_packages(package.__path__, package.__name__ + "."):
            module = importlib.import_module(module_name)
            if hasattr(module, "logger"):
                module.logger = get_logger_with_interaction_id("pydantic")
            if is_pkg:
                recursive_logger_patch(module)
    recursive_logger_patch(pydantic)
```

### 4. Asynchronous trace details

Using Loguru's `record` object, we extracted file paths, function names, and line numbers, transforming them into a fully qualified module trace.

```python
def add_context_to_logs(record):
    full_module = record["file"].path.replace("/", ".").rsplit(".", 1)[0][1:]
    function = record["function"]
    line = record["line"]
    context_extra["TRACE"] = f"{full_module}:{function}:{line}"
    record["extra"].update(context_extra)
    return True
```

Benefits:

- **Granular debugging:** developers can pinpoint the exact location of issues, even in asynchronous workflows.
- **Unified view:** trace details align with contextual metadata, enabling complete lifecycle visibility.

## Challenges and solutions

- **Singleton logger issues:** Loguru's singleton model risked unintended overrides when binding module-specific loggers. We mitigated this by isolating `bind()` calls to ensure context-specific segregation.
- **Handling recursive patching:** Applying our custom logger recursively to all pydantic submodules required careful handling to avoid infinite loops or missed modules. The solution involved controlled recursion and exception handling.
- **Balancing detail and noise:** Including extensive metadata risked overwhelming logs. We tailored formats based on module types, e.g., only including user/account IDs for API logs.

## Impact: transforming observability

With our revamped logging system, we achieved:

- **Unified observability:** logs across all modules, including pydantic, now follow the same structure.
- **Seamless debugging:** granular trace details enable developers to locate issues precisely.
- **Context-rich insights:** logs tied to user interactions and API calls simplify asynchronous debugging.

The final logs looked like this:

```
2024-12-16 14:49:36 app.module.processor.task_processor:process_frame:166 | ML_MODULE | INFO | User stopped speaking | session12345-interaction-id
2024-12-16 14:49:37 app.communication.service.daily:on_participant_left:569 | COMM_MODULE | INFO | Participant left participant-id-12345
2024-12-16 14:49:37 app.module.bot:on_participant_left:76 | ML_MODULE | INFO | Ending the bot as the participant left: Name: {'id': 'participant-id-12345', 'info': {'userName': 'John Doe', 'isLocal': False, 'permissions': {'canSend': ['microphone', 'screenVideo', 'screenAudio', 'customVideo', 'customAudio', 'camera'], 'hasPresence': True, 'canAdmin': []}, 'joinedAt': 1734340758, 'isOwner': False}}, Reason: leftCall
2024-12-16 14:49:37 app.communication.service.daily:leave:414 | COMM_MODULE | INFO | Leaving https://example.com/session12345-interaction-id
2024-12-16 14:49:37 app.module.bot:on_call_state_updated:83 | ML_MODULE | INFO | Call state updated: leaving
2024-12-16 14:49:37 app.module.bot:on_call_state_updated:83 | ML_MODULE | INFO | Call state updated: left
2024-12-16 14:49:37 app.module.bot:on_call_state_updated:85 | ML_MODULE | INFO | Ending the bot as the call state is left
2024-12-16 14:49:37 app.communication.service.daily:leave:423 | COMM_MODULE | INFO | Left https://example.com/session12345-interaction-id
```

## Conclusion

Logs are no longer just error reports; they are narratives that tell the story of your system. By integrating Loguru and embracing context-driven enrichment, we turned logs into a powerful debugging tool. The result is faster issue resolution, deeper insights, and a smoother developer experience.

This journey showcased the power of adapting existing tools to modern challenges, ensuring that even in the complexity of asynchronous systems, your logs always tell the full story.
