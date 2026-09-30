import type { Chapter } from '../types'

export const objects: Chapter = {
  id: 'objects',
  title: 'Objects & good design',
  description: 'Model behavior, protect state, and build useful abstractions.',
  level: 'Beginner',
  accent: 'gold',
  lessons: [
    {
      id: 'classes-and-encapsulation',
      title: 'Classes, objects & encapsulation',
      subtitle: 'Make invalid states harder to create, not just easier to describe.',
      minutes: 24,
      tags: [
        'class',
        'object',
        'constructor',
        'property',
        'encapsulation',
        'static',
        'access modifiers',
        'required',
      ],
      outcomes: [
        'Separate a type definition from its instances.',
        'Protect invariants with constructors and methods.',
        'Choose meaningful access modifiers.',
      ],
      sections: [
        {
          title: 'A class combines state and behavior',
          body: "A class defines a reference type. An object is an instance of that type, with its own instance state. Two TaskItem objects can have different titles even though they share the same class definition. A constructor establishes the object's initial state. A field stores data; a property exposes access through accessor methods.\n\n**Encapsulation** means controlling how state is accessed and changed. It is not merely making every field private and every property public. A public setter that permits any value can still destroy an invariant, which is a rule that must always be true for a valid object. For TaskFlow, a task might always need a nonblank title.",
        },
        {
          title: 'Design the public surface',
          body: '| Modifier | Visibility |\n| --- | --- |\n| `public` | Available to callers with access to the containing type |\n| `private` | Available within the containing type |\n| `internal` | Available within the assembly |\n| `protected` | Available in the containing type and derived types |\n| `protected internal` | Same assembly OR derived access |\n| `private protected` | Derived access within the same assembly |\n\nGive callers the operations they need, such as Complete, rather than all implementation details. An init accessor allows assignment during initialization. The required modifier makes callers initialize a member in supported construction paths; it does not validate that its content is sensible or non-null at runtime.',
        },
        {
          title: 'State belongs somewhere',
          body: 'Instance members belong to an object. Static members belong to the type rather than a particular instance. A static mutable List of tasks is shared within the process and can create race conditions in a web app. It is neither durable storage nor automatically thread-safe. Static pure helper methods are much easier to reason about than hidden global mutable state.\n\nA constructor should leave an object usable or fail clearly. Avoid starting network work or hiding expensive side effects in ordinary constructors. For persistence frameworks and serializers, understand their construction requirements instead of weakening every domain rule preemptively. Later, request DTOs and database entities will have distinct responsibilities.',
        },
      ],
      diagram: {
        title: 'Protect the task invariant',
        source:
          'flowchart LR\n  input["Proposed title"] --> ctor["Constructor validation"]\n  ctor --> task["Valid TaskItem"]\n  task --> complete["Complete method"]\n  complete --> state["Controlled state change"]',
        caption:
          'The public contract exposes meaningful operations while the object protects its own rules.',
      },
      example: {
        title: 'A task that protects its title',
        filename: 'Program.cs',
        language: 'csharp',
        setup: 'Complete console example. Type declarations follow the top-level statements.',
        code: 'var task = new TaskItem("  Learn encapsulation  ");\ntask.Complete();\nConsole.WriteLine($"{task.Title}: {task.IsComplete}");\n\npublic sealed class TaskItem\n{\n    public string Title { get; }\n    public bool IsComplete { get; private set; }\n\n    public TaskItem(string title)\n    {\n        ArgumentException.ThrowIfNullOrWhiteSpace(title);\n        Title = title.Trim();\n    }\n\n    public void Complete() => IsComplete = true;\n}',
        output: 'Learn encapsulation: True',
        explanation: [
          'The constructor rejects an invalid title and normalizes a valid one.',
          'Callers can read completion state but must use the Complete operation to change it.',
          'sealed prevents inheritance from this type. It does not make the object immutable: Complete still changes instance state.',
        ],
      },
      traps: [
        {
          question: 'Are properties just public fields with nicer syntax?',
          answer:
            'No. Properties are members with accessors and can validate, compute, or control access. They have different reflection and API behavior from fields. Automatic properties simply generate backing storage.',
          warning: 'An expensive or surprising property getter can still be poor API design.',
        },
        {
          question: 'Does required guarantee valid data?',
          answer:
            'It expresses an initialization requirement checked by supporting compilers. It does not implement business validation, and it does not make runtime null or malformed input impossible.',
          warning: 'Initialization, nullability analysis, and validation solve different problems.',
        },
      ],
      exercise: {
        title: 'Add a controlled rename operation',
        brief: 'TaskFlow now allows task titles to change, but never to become blank.',
        steps: [
          'Add Rename with the same validation rule as construction.',
          'Allow title assignment only from inside the type.',
          'Test an empty title, whitespace, and a valid renamed title.',
        ],
        solution:
          'Make Title privately settable and centralize normalization in a helper used by both construction and Rename. Reject invalid input before changing state so a failed rename leaves the existing task intact. Avoid duplicating subtly different validation rules.',
      },
      quiz: {
        question: 'Which statement about a sealed class is true?',
        options: [
          'Its properties cannot change',
          'It cannot be inherited from',
          'It is always allocated on the stack',
          'All members are static',
        ],
        answer: 1,
        explanation:
          'Sealed prevents deriving a class from it. Mutability is determined by the members and operations it exposes, not by the sealed keyword.',
      },
      references: [
        {
          label: 'Classes and objects',
          url: 'https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/object-oriented/classes',
        },
      ],
    },
    {
      id: 'interfaces-and-polymorphism',
      title: 'Interfaces, inheritance & polymorphism',
      subtitle: 'Depend on a useful promise, while allowing different implementations.',
      minutes: 25,
      tags: [
        'interface',
        'abstract',
        'virtual',
        'override',
        'new',
        'polymorphism',
        'inheritance',
        'composition',
      ],
      outcomes: [
        'Explain interface contracts and runtime dispatch.',
        'Choose between an interface and an abstract base class.',
        'Distinguish hiding, overriding, and overloading.',
      ],
      sections: [
        {
          title: 'Substitute behavior through a contract',
          body: 'An interface describes a capability. INotifier might promise a Send method without specifying whether delivery uses email, a console, or a test double. Code that depends on INotifier can use different implementations without changing its own logic. This is useful when the boundary is real, not as a reason to create an interface for every class.\n\n**Polymorphism** means callers can use a shared contract while the actual object determines behavior. For virtual class members, override participates in runtime dispatch. A base class method must be virtual, abstract, or already overridden to support overriding. An abstract member declares behavior that a non-abstract derived type must implement.',
        },
        {
          title: 'Inheritance and composition have different costs',
          body: 'An abstract base class can hold instance state, constructors, and shared implementation. An interface supports a capability contract without requiring a shared base class. A class has one direct base class but can implement multiple interfaces. Modern interfaces can include more than old-style method signatures, including default implementations and static abstract members; that does not make them ordinary stateful base classes.\n\nUse inheritance when the derived type truly satisfies the base contract. If a ReadOnlyTaskList inherits a mutable list but throws from Add, callers may be surprised. **Composition** means giving an object collaborators instead: a task service has a notifier. It usually creates less coupling than inheriting a large behavior hierarchy.',
        },
        {
          title: 'Watch the dispatch rules',
          body: "| Mechanism | Decision |\n| --- | --- |\n| Overload | Select a method signature, primarily from compile-time information |\n| Override | Use the runtime object's implementation of a virtual member |\n| `new` member hiding | Select based on the reference's compile-time type |\n\nThe new keyword on a method hides a member; it does not override it. A reference typed as the base class can therefore call different behavior from a reference typed as the derived class. In an interview, explain the declared reference type and actual object type before predicting output. Those two pieces of information resolve many confusing examples.",
        },
      ],
      diagram: {
        title: 'One contract, multiple implementations',
        source:
          'flowchart TB\n  service["TaskService"] --> contract["INotifier"]\n  contract --> console["ConsoleNotifier"]\n  contract --> email["EmailNotifier"]\n  contract --> fake["Recording test double"]',
        caption: 'The service knows the contract. The composition root selects the implementation.',
      },
      example: {
        title: 'Swap notification behavior',
        filename: 'Program.cs',
        language: 'csharp',
        setup:
          'Complete console example. No dependency injection container is required to understand this contract.',
        code: 'INotifier notifier = new ConsoleNotifier();\nnotifier.Send("Task completed");\n\npublic interface INotifier\n{\n    void Send(string message);\n}\n\npublic sealed class ConsoleNotifier : INotifier\n{\n    public void Send(string message)\n        => Console.WriteLine($"Notification: {message}");\n}',
        output: 'Notification: Task completed',
        explanation: [
          'The variable is declared as INotifier, while the actual object is a ConsoleNotifier.',
          'The implementation provides the promised Send behavior.',
          'A test can substitute an implementation that records messages without writing to a real console or sending email.',
        ],
      },
      traps: [
        {
          question: 'Is new on a derived method the same as override?',
          answer:
            'No. New hides the inherited member; selection depends on the compile-time reference type. Override participates in virtual dispatch using the runtime object type.',
          warning:
            'Do not predict output from only the class name used with new in the constructor expression.',
        },
        {
          question: 'Should every class have an interface?',
          answer:
            'No. An interface is useful for a meaningful contract, alternative implementations, or a dependency boundary. A one-to-one interface can add indirection without improving the design.',
          warning: 'Testability does not require mocking every object.',
        },
      ],
      exercise: {
        title: 'Replace a side effect',
        brief: 'Add a RecordingNotifier that stores received messages in memory.',
        steps: [
          'Implement INotifier without changing its contract.',
          'Call it through an INotifier reference.',
          'Explain how a test can inspect the recorded messages afterward.',
        ],
        solution:
          'Keep a concrete RecordingNotifier variable for test inspection and pass the same object as INotifier to the consumer. The consumer only knows Send; the test can assert the recording collection. The abstraction isolates the side effect, not the entire application.',
      },
      quiz: {
        question: 'What selects an overridden virtual method implementation?',
        options: [
          'Only the variable name',
          'The actual runtime object type',
          'The return type alone',
          'The file containing the call',
        ],
        answer: 1,
        explanation:
          'Virtual dispatch uses the actual runtime object. The compile-time type still determines which members and overloads are available at the call site.',
      },
      references: [
        {
          label: 'Polymorphism',
          url: 'https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/object-oriented/polymorphism',
        },
        {
          label: 'Interfaces',
          url: 'https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/interfaces',
        },
      ],
    },
    {
      id: 'value-reference-records',
      title: 'Value types, reference types & records',
      subtitle: 'Understand copying and equality without the stack-versus-heap myth.',
      minutes: 28,
      tags: [
        'struct',
        'class',
        'record',
        'record struct',
        'equality',
        'boxing',
        'stack',
        'heap',
        'with',
      ],
      outcomes: [
        'Predict assignment behavior for values and references.',
        'Explain record equality and shallow copying.',
        'Avoid unreliable memory-location shortcuts.',
      ],
      sections: [
        {
          title: 'Semantics come before storage location',
          body: 'A value-type variable contains a value; assignment copies that value. A reference-type variable contains a reference; assignment copies the reference. Two copied references can point to the same object. This distinction explains behavior more reliably than saying structs are on the stack and classes are on the heap.\n\nStorage depends on context. A struct can be a field inside a heap object, an array element, or a boxed value. Runtime optimizations can further change allocation details. A struct can also contain a reference field, so copying the struct can leave both copies referring to the same mutable object. Value type does not mean deep copy of everything reachable.',
        },
        {
          title: 'Choose equality deliberately',
          body: 'Ordinary classes typically use reference equality unless they implement value-based equality. Records generate value-oriented equality based on their members. A record class is still a reference type; a record struct is a value type. The word record describes generated behavior, not one universal memory model.\n\nFor TaskFlow, an entity with a stable database identity is different from a snapshot of displayed data. Equality based on every mutable entity field can be inconvenient. An immutable response record, however, is often a good fit for transporting a snapshot. Hash-based collections require equality and GetHashCode to agree, and keys must not change in ways that break lookup.',
        },
        {
          title: 'Copying can still share nested objects',
          body: 'A record with expression creates a copy with selected changes. It is a **shallow copy**: referenced members are not recursively cloned. If a record contains a List, both copies can share the same List. Positional record properties are commonly init-only, but init-only does not freeze objects they reference.\n\nReadonly structs can help communicate value immutability, but copying large structs has a cost. Boxing a value type into object normally creates a separate boxed value; unboxing requires the correct underlying value type. Do not choose structs purely as an allocation trick. Choose them for small, coherent value semantics, then measure performance if it matters.',
        },
      ],
      diagram: {
        title: 'A shallow record copy',
        source:
          'flowchart TB\n  original["Original record"] --> list["Shared labels List"]\n  copy["Record copied with with"] --> list\n  original --> first["Title: Learn"]\n  copy --> second["Title: Practice"]',
        caption:
          'The outer record is copied, but a reference-typed member can still point to the same nested object.',
      },
      example: {
        title: 'See record equality and copying',
        filename: 'Program.cs',
        language: 'csharp',
        setup:
          'Complete console example. The List member intentionally demonstrates shallow copying.',
        code: 'var first = new TaskSnapshot("Learn", new List<string> { "C#" });\nvar second = first with { Title = "Practice" };\nsecond.Labels.Add(".NET");\n\nConsole.WriteLine(first.Title);\nConsole.WriteLine(first.Labels.Count);\nConsole.WriteLine(ReferenceEquals(first.Labels, second.Labels));\nConsole.WriteLine(new Point(2, 3) == new Point(2, 3));\n\npublic record TaskSnapshot(string Title, List<string> Labels);\npublic readonly record struct Point(int X, int Y);',
        output: 'Learn\n2\nTrue\nTrue',
        explanation: [
          'The copied record has a different Title, leaving the original title unchanged.',
          'Both record instances share the same labels List, so its mutation is visible through either record.',
          'The record struct Point has generated value equality. The two distinct values compare equal.',
        ],
      },
      traps: [
        {
          question: 'Are all structs allocated on the stack?',
          answer:
            'No. Value types can be embedded in heap objects or arrays and can be boxed. Their defining property is value semantics, not a fixed physical storage location.',
          warning:
            'Do not use the stack/heap slogan as the definition of value and reference types.',
        },
        {
          question: 'Is a record automatically deeply immutable?',
          answer:
            'No. Record classes can contain mutable properties and mutable referenced objects. With expressions copy references shallowly. You must design deep immutability explicitly when required.',
          warning:
            'List members do not gain structural element equality just because their containing type is a record.',
        },
      ],
      exercise: {
        title: 'Design an API snapshot',
        brief: 'Choose a type for a task response containing an ID, title, and completion flag.',
        steps: [
          'Decide whether the snapshot needs mutation after creation.',
          'Use an appropriate record shape.',
          'Explain what would change if you added a mutable List of labels.',
        ],
        solution:
          'A positional record class such as TaskResponse(int Id, string Title, bool IsComplete) is a clear immutable-by-initialization DTO for simple fields. If labels are added, choose a representation and copying policy deliberately. A read-only interface alone does not make its backing list immutable.',
      },
      quiz: {
        question: 'What does a record with expression normally do to a List member?',
        options: [
          'Deep-clones every element',
          'Copies the reference to the same List',
          'Converts it into an immutable array',
          'Removes it from the copy',
        ],
        answer: 1,
        explanation:
          'The generated copy is shallow. Reference-typed members keep references to the same objects unless your code explicitly replaces or copies them.',
      },
      references: [
        {
          label: 'Records',
          url: 'https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/records',
        },
        {
          label: 'Value types',
          url: 'https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/value-types',
        },
      ],
    },
    {
      id: 'solid-and-composition',
      title: 'SOLID without overengineering',
      subtitle: 'Use design principles to reduce real change costs, not to add more layers.',
      minutes: 26,
      tags: ['SOLID', 'SRP', 'OCP', 'LSP', 'ISP', 'DIP', 'composition', 'dependency inversion'],
      outcomes: [
        'Explain the five principles through concrete failure modes.',
        'Separate policy from external mechanisms.',
        'Recognize unnecessary abstraction.',
      ],
      sections: [
        {
          title: 'Principles are questions, not a checklist score',
          body: '**Single responsibility** asks whether unrelated reasons for change have been mixed together. A task-completion rule and an SMTP protocol implementation change for different reasons. **Open/closed** asks whether a stable extension point can accommodate variation without editing central logic every time. It does not mean existing code can never be modified.\n\n**Liskov substitution** asks whether implementations preserve the expectations of a shared contract. A derived type that unexpectedly rejects operations the base contract promises is a warning sign. Think in terms of preconditions, results, and invariants, not just whether the compiler accepts the inheritance.',
        },
        {
          title: 'Keep contracts small and dependencies sensible',
          body: '**Interface segregation** means consumers should not depend on operations they do not need. A reporting service should not require a giant task repository contract with account deletion and payment methods. **Dependency inversion** means high-level policy should not be tightly coupled to low-level mechanisms; both can depend on a suitable abstraction.\n\nDependency injection is a technique for supplying collaborators. Dependency inversion is a design principle about dependency direction. You can inject a concrete class without achieving a useful inversion, and you can use the principle without a DI container. The example uses ordinary construction to make the relationship visible.',
        },
        {
          title: 'Choose the smallest helpful boundary',
          body: 'TaskFlow needs to notify someone after completing a task. Putting email transport directly inside the completion method couples business behavior to credentials, network failures, and an external server. A notifier contract lets the policy be tested without those mechanisms.\n\nHowever, adding factories, generic repositories, adapters, and five projects to a three-endpoint demo may make change harder. Start with the actual sources of variation and the tests you need. Keep closely related behavior together, prefer composition over deep inheritance, and split only where the separation earns its cost. A clean architecture diagram is not evidence that an application is maintainable.',
        },
      ],
      diagram: {
        title: 'Separate policy from delivery',
        source:
          'flowchart LR\n  endpoint["HTTP endpoint"] --> policy["Task completion policy"]\n  policy --> contract["INotifier contract"]\n  delivery["Console / email adapter"] -. implements .-> contract',
        caption:
          'The business operation depends on a delivery capability, not the details of a particular transport.',
      },
      example: {
        title: 'Inject a small collaborator',
        filename: 'Program.cs',
        language: 'csharp',
        setup:
          'Complete console example. Manual construction is the composition root for this small application.',
        code: 'var service = new TaskService(new ConsoleNotifier());\nservice.Complete("Understand SOLID");\n\npublic interface INotifier\n{\n    void Send(string message);\n}\n\npublic sealed class ConsoleNotifier : INotifier\n{\n    public void Send(string message) => Console.WriteLine(message);\n}\n\npublic sealed class TaskService(INotifier notifier)\n{\n    public void Complete(string title)\n    {\n        ArgumentException.ThrowIfNullOrWhiteSpace(title);\n        notifier.Send($"Completed: {title}");\n    }\n}',
        output: 'Completed: Understand SOLID',
        explanation: [
          'The primary constructor makes the required dependency explicit. Ordinary constructors would express the same design.',
          'This deliberately small example models the completion notification, not persistence or a complete task aggregate.',
          'The caller chooses the implementation; TaskService only uses the promised notification behavior.',
        ],
      },
      traps: [
        {
          question: 'Does dependency injection automatically satisfy SOLID?',
          answer:
            'No. Injecting an oversized or inappropriate dependency can preserve poor coupling. DI controls construction; the quality of the contract and dependency direction is a design decision.',
          warning: 'A container is not an architecture.',
        },
        {
          question: 'Does single responsibility mean one method per class?',
          answer:
            'No. A class can have many related operations serving one cohesive responsibility. The useful question is whether independent changes force the same unit to change for unrelated reasons.',
          warning:
            'Excessively fragmented classes can make a simple workflow harder to understand.',
        },
      ],
      exercise: {
        title: 'Find a meaningful boundary',
        brief: 'A method validates a task, writes SQL, sends email, and formats an HTTP response.',
        steps: [
          'Identify the independent reasons that method changes.',
          'Choose one useful dependency boundary first.',
          'Describe the smallest test enabled by your change.',
        ],
        solution:
          'Separate the business operation from a volatile side effect such as notification delivery. Test the task rule using a recording notifier. Keep HTTP response formatting at the endpoint boundary. Avoid creating abstractions for every line before understanding the actual change and testing needs.',
      },
      quiz: {
        question: 'Which statement best distinguishes DI from dependency inversion?',
        options: [
          'They are identical names for a container',
          'DI supplies dependencies; inversion concerns design direction',
          'Inversion only works with inheritance',
          'DI requires every dependency to be static',
        ],
        answer: 1,
        explanation:
          'Dependency injection is a construction technique. Dependency inversion concerns how high-level policy and lower-level implementation depend on contracts. One does not guarantee the other.',
      },
      references: [
        {
          label: 'Architectural principles',
          url: 'https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/architectural-principles',
        },
      ],
    },
    {
      id: 'delegates-events-lambdas',
      title: 'Delegates, lambdas & events',
      subtitle: 'Pass behavior as data, and understand who is allowed to raise an event.',
      minutes: 25,
      tags: ['delegate', 'Action', 'Func', 'lambda', 'event', 'closure', 'subscription'],
      outcomes: [
        'Use typed delegates for callbacks and predicates.',
        'Explain event access and synchronous delivery.',
        'Recognize captured-variable and subscription lifetime risks.',
      ],
      sections: [
        {
          title: 'A typed reference to behavior',
          body: 'A delegate is a type-safe callable reference. Action<T> represents an operation with an input and no returned result. Func<T, TResult> represents an operation with an input and a result. A lambda is concise syntax for an anonymous function, such as `task => task.IsComplete`. The surrounding target type determines whether that lambda becomes a delegate or, in some contexts, an expression tree.\n\nPassing behavior is useful when an algorithm stays the same but one choice varies. List filtering can accept a predicate instead of requiring a new loop for every rule. Keep callbacks predictable: a predicate that unexpectedly modifies global state is harder to reason about than one that simply answers true or false.',
        },
        {
          title: 'Events restrict the public contract',
          body: 'An event provides subscription and unsubscription while reserving invocation to the declaring type in ordinary usage. Exposing a public delegate field would let outside callers replace its invocation list or invoke it directly. An event narrows that authority.\n\nNormal delegate invocation is synchronous. Subscribers run on the invoking thread unless your code explicitly schedules work. If a handler throws, ordinary multicast invocation stops and propagates that exception; it is not an automatic reliable message bus. Async void event handlers have special exception and completion behavior, so use them only where an event signature requires them and handle failures deliberately.',
        },
        {
          title: 'Captured state has a lifetime',
          body: 'A lambda can capture a variable from its enclosing scope. It captures the variable, not necessarily a frozen copy of its value. If the variable changes before the delegate runs, the delegate can observe the newer value. This explains common loop and delayed-callback surprises. Capture a deliberate local copy when a snapshot is what you mean.\n\nAn event publisher can keep its subscribers reachable through delegate references. A long-lived publisher can therefore retain a short-lived subscriber. Unsubscribe when the subscription lifetime ends, or use a design with explicit ownership. Events are useful for in-process coordination; durable cross-service notifications need a different mechanism, covered in the architecture chapter.',
        },
      ],
      diagram: {
        title: 'Publish an in-process event',
        source:
          'flowchart LR\n  action["Complete task"] --> publisher["TaskBoard raises event"]\n  publisher --> handler1["Console subscriber"]\n  publisher --> handler2["Metrics subscriber"]',
        caption:
          'Ordinary subscribers run synchronously. This diagram does not imply parallel or durable delivery.',
      },
      example: {
        title: 'Subscribe to task completion',
        filename: 'Program.cs',
        language: 'csharp',
        setup:
          'Complete console example. The named delegate variable allows reliable unsubscription.',
        code: 'var board = new TaskBoard();\nAction<string> handler = title => Console.WriteLine($"Done: {title}");\nboard.Completed += handler;\nboard.Complete("Learn events");\nboard.Completed -= handler;\nboard.Complete("No listener now");\n\npublic sealed class TaskBoard\n{\n    public event Action<string>? Completed;\n\n    public void Complete(string title)\n    {\n        ArgumentException.ThrowIfNullOrWhiteSpace(title);\n        Completed?.Invoke(title);\n    }\n}',
        output: 'Done: Learn events',
        explanation: [
          'The event is nullable because zero listeners is a valid state. Conditional invocation handles that case.',
          'The same delegate instance is used for subscription and unsubscription.',
          'The second operation still occurs, but there is no remaining listener to print a message.',
        ],
      },
      traps: [
        {
          question: 'Does an event make handlers asynchronous?',
          answer:
            'No. Normal invocation calls subscribers synchronously. Scheduling and durability are separate concerns. A slow handler can delay the publisher, and an exception can stop later handlers.',
          warning: 'Do not use ordinary events as if they were a reliable distributed queue.',
        },
        {
          question: 'Does a lambda capture the current value forever?',
          answer:
            'It generally captures a variable. Later changes to that captured variable can be observed when the lambda runs. Create a deliberate local snapshot when that is the intended behavior.',
          warning: 'Capture semantics matter in loops, callbacks, and long-lived subscriptions.',
        },
      ],
      exercise: {
        title: 'Observe a closure',
        brief:
          'Create an Action that prints a task count, then change the count before invoking it.',
        steps: [
          'Predict whether it prints the old or new value.',
          'Run the example.',
          'Create a separate captured snapshot variable and compare the two callbacks.',
        ],
        solution:
          'An action closing over the count variable observes its updated value. An action closing over a separate snapshot variable sees that variable instead. The key is which variable each delegate captures, not when the lambda text was first encountered.',
      },
      quiz: {
        question: 'Why expose an event instead of a public delegate field?',
        options: [
          'Events automatically retry failures',
          'Events always run on background threads',
          'Events restrict outsiders to subscription operations',
          'Events never retain subscribers',
        ],
        answer: 2,
        explanation:
          'The event contract allows subscribers to add and remove handlers while the declaring type controls raising it. It does not automatically provide concurrency, reliability, or weak references.',
      },
      references: [
        {
          label: 'Delegates',
          url: 'https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/delegates/',
        },
        {
          label: 'Events',
          url: 'https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/events/',
        },
      ],
    },
  ],
}
