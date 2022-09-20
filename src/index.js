// クラスでモデルを作る
// モデルはそのアプリケーションが扱う領域のデータとビジネスロジック(ショッピングの合計額や送料を計算する業務に関するロジック)を表現する
// データの変更をビューに通知するのもモデルの責任である。
// 今回はモデルからではなく、コントローラを通してビューに通知する
class TodoListModel {
  constructor() {
    this.idCounter = 0;
    this.todos = new Map();
  }

  // 追加メソッド
  addTodo(task) {
    this.idCounter += 1;
    this.todos.set(this.idCounter, {
      id: this.idCounter,
      task,
      checked: false,
    });
    return this.idCounter;
  }

  // 取得メソッド
  getTodo(id) {
    return this.todos.get(id);
  }

  // 削除メソッド
  removeTodo(id) {
    this.todos.delete(id);
  }

  checkTodo(id, isCheck) {
    const todo = this.todos.get(id);
    todo.checked = isCheck;
    return todo;
  }
}

const todoList = new TodoListModel();

// クラスでビューを作る
// モデルのデータを取り出して、ユーザーが見るのに適した形で表示する役割。
// すなわち、UIの構築を担当する
// モデルとビューを導入することで、データとUIを切り離すことができた。
class View {
  // todoをUIに追加する
  addTodo(todo) {
    const todosEl = document.getElementById("todos");
    const todoEl = this._createTodoElement(todo);
    todosEl.appendChild(todoEl);
  }

  // todo要素を作る
  _createTodoElement(todo) {
    const { id, task } = todo;

    const todoEl = document.createElement("div");
    todoEl.className = "content";
    todoEl.id = `todo-${id}`;

    const label = document.createElement("label");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = `checkbox-${id}`;

    const span = document.createElement("span");
    span.className = "check-span";
    span.textContent = `${task}`;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "delete-button";
    button.id = `button-${id}`;
    button.textContent = "削除";

    label.appendChild(checkbox);
    label.appendChild(span);
    todoEl.appendChild(label);
    todoEl.appendChild(button);

    return todoEl;
  }

  // 更新処理
  check(id) {
    const todoEl = document.getElementById(`todo-${id}`);
    todoEl.className = "checked";
  }

  unCheck(id) {
    const todoEl = document.getElementById(`todo-${id}`);
    todoEl.className = "";
  }

  // 削除処理
  removeTodo(id) {
    const todoEl = document.getElementById(`todo-${id}`);
    todoEl.remove();
  }

  // 入力フォームのリセット
  resetTodo() {
    const inputEl = document.getElementById("input-form");
    inputEl.value = "";
  }
}

const view = new View();

// classでコントローラを作る
// コントローラは、「ユーザーからの入力」を「モデルへのメッセージ」へと変換してモデルに伝える役割
// すなわち、UIからの入力を担当しているとも言える。
// 描画を直接行ったり、モデルの内部データを直接操作したりはしない。
// Controller は「ユーザーからの入力」を 「Model や View の変更」に変換する役割
// MVCパターンの良くない4つの点
// 1. View と Model の同期はコントローラで手動で行う必要があるので、忘れる可能性がある。もし忘れると、最新の情報がViewに反映されていない
// 2. コントローラ内でイベントハンドラを手動で登録している。忘れる可能性がある
// 3. コントローラでボタンがクリックされたらこの関数を実行すべきという処理を加えている。
// コントローラは、UIにどんなHTML要素があり、どんなidが付与されているかを知っている必要がある。つまり、コントローラはViewに依存している。
// 何かに依存を持つことは、責務の分離の観点からなるべく避けるべき
// 4. 責務を分割するのは良いが、その分コード量が増えている。もし機能や拡張性や安全性が同じなら短いコードのが良い。バグが増えずらいし。
class Controller {
  setup() {
    this.handleSubmitForm();
  }

  handleSubmitForm() {
    const registerButton = document.getElementById("register");
    registerButton.addEventListener("click", (e) => {
      e.preventDefault();

      const input = document.getElementById("input-form");
      const task = input.value;
      if (!task.length > 0) {
        alert("テキストを1文字以上入力してください");
        return;
      }
      // モデルで生成したインスタンスを更新した後に、UIを更新している。
      // こうすることで、データとして新しいTodoを保存して、それをUIに反映できる。
      // ユーザーからのフォーム送信イベントをコントローラからモデルとビューへと反映している。

      // modelにTodoを追加
      const addedTodoId = todoList.addTodo(task);

      // UIに追加するTodoを取得
      const todo = todoList.getTodo(addedTodoId);

      // UIに反映
      view.addTodo(todo);
      this.handleCheckTask(todo.id);
      this.handleClickDeleteTask(todo.id);
    });
  }

  handleCheckTask(id) {
    const checkBoxEl = document.getElementById(`checkbox-${id}`);
    checkBoxEl.onchange = function (e) {
      const checked = e.target.checked;
      const stateChangedTodo = todoList.checkTodo(id, checked);
      if (stateChangedTodo.checked) {
        view.check(stateChangedTodo.id);
      } else {
        view.unCheck(stateChangedTodo.id);
      }
    };
  }

  handleClickDeleteTask(id) {
    todoList.removeTodo(id);
    const buttonEl = document.getElementById(`button-${id}`);
    buttonEl.onclick = function () {
      view.removeTodo(id);
    };
  }
}

const formController = new Controller();
formController.setup();
